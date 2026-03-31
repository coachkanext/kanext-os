/**
 * Personal Hub — Creator backend + public-facing profile.
 * RBAC flip: owner sees analytics/admin tools, visitor sees public profile.
 * Three views: Overview / Page / Members via centered dropdown pill.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  HUB_PROFILE, HUB_ANALYTICS, HUB_CHART_DATA, HUB_ACTIVITY, HUB_GOALS,
  HUB_TIERS, HUB_SUBSCRIBERS, HUB_NEWSLETTERS, HUB_LINKS, HUB_PORTFOLIO,
  HUB_FEATURED,
  getChartMax, getTierName,
  type ChartMetric, type MemberTier, type HubLink,
} from '@/data/mock-hub';

type HubTab = 'Overview' | 'Page' | 'Members';

const OVERVIEW_PILLS = ['All', 'Followers', 'Earnings', 'Content', 'Subscribers'];
const PAGE_PILLS     = ['All', 'Links', 'Portfolio', 'Featured'];
const MEMBERS_PILLS  = ['All Tiers', 'Free', 'Paid', 'Newsletter'];

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const BAR_MAX_H  = 100;

function pillsForTab(tab: HubTab): string[] {
  if (tab === 'Overview') return OVERVIEW_PILLS;
  if (tab === 'Page')     return PAGE_PILLS;
  return MEMBERS_PILLS;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, trend, C }: {
  icon: string; value: string; label: string; trend: number; C: ComponentColors;
}) {
  const up = trend >= 0;
  return (
    <View style={[cardStyles.statCard, { backgroundColor: C.surface }]}>
      <IconSymbol name={icon as any} size={20} color={C.accent} />
      <Text style={[cardStyles.statValue, { color: C.label }]}>{value}</Text>
      <Text style={[cardStyles.statLabel, { color: C.secondary }]}>{label}</Text>
      <View style={[cardStyles.trendBadge, { backgroundColor: up ? '#5A8A6E22' : '#B85C5C22' }]}>
        <Text style={[cardStyles.trendText, { color: up ? '#5A8A6E' : '#B85C5C' }]}>
          {up ? '+' : ''}{trend}%
        </Text>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  statCard: {
    width: 120, borderRadius: 14, padding: 14, gap: 6, marginRight: 10,
    alignItems: 'flex-start',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  trendBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  trendText: { fontSize: 11, fontWeight: '700' },
});

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function BarChart({ metric, C }: { metric: ChartMetric; C: ComponentColors }) {
  const max = getChartMax(metric);
  return (
    <View style={[chartStyles.wrap, { backgroundColor: C.surface }]}>
      <View style={chartStyles.bars}>
        {HUB_CHART_DATA.map(pt => {
          const h = max > 0 ? Math.round((pt[metric] / max) * BAR_MAX_H) : 4;
          return (
            <View key={pt.label} style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <View style={[chartStyles.bar, { height: h, backgroundColor: C.accent }]} />
              </View>
              <Text style={[chartStyles.barLabel, { color: C.muted }]}>{pt.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: { borderRadius: 14, padding: 14, marginBottom: 20 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 24, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '80%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, fontWeight: '500' },
});

// ── Progress Row ──────────────────────────────────────────────────────────────

function GoalRow({ goal, C }: { goal: typeof HUB_GOALS[0]; C: ComponentColors }) {
  const pct = Math.min(goal.current / goal.target, 1);
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
  return (
    <View style={[goalStyles.row, { borderBottomColor: C.separator }]}>
      <View style={goalStyles.top}>
        <Text style={[goalStyles.label, { color: C.label }]}>{goal.label}</Text>
        <Text style={[goalStyles.values, { color: C.secondary }]}>{fmt(goal.current)} / {fmt(goal.target)}</Text>
      </View>
      <View style={[goalStyles.track, { backgroundColor: C.surfacePressed }]}>
        <View style={[goalStyles.fill, { width: `${pct * 100}%` as any, backgroundColor: pct >= 1 ? '#5A8A6E' : C.accent }]} />
      </View>
    </View>
  );
}

const goalStyles = StyleSheet.create({
  row: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  values: { fontSize: 13 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});

// ── Activity Row ──────────────────────────────────────────────────────────────

function ActivityRow({ item, C, last }: { item: typeof HUB_ACTIVITY[0]; C: ComponentColors; last: boolean }) {
  const iconColor = item.type === 'payout' ? '#5A8A6E' : item.type === 'subscribe' ? C.accent : C.secondary;
  return (
    <View style={[actStyles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
      <View style={[actStyles.iconWrap, { backgroundColor: C.surfacePressed }]}>
        <IconSymbol name={item.icon as any} size={16} color={iconColor} />
      </View>
      <View style={actStyles.info}>
        <Text style={[actStyles.message, { color: C.label }]} numberOfLines={1}>{item.message}</Text>
        <Text style={[actStyles.detail, { color: C.secondary }]}>{item.detail} · {item.timeAgo}</Text>
      </View>
    </View>
  );
}

const actStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info: { flex: 1 },
  message: { fontSize: 14, fontWeight: '500' },
  detail: { fontSize: 12, marginTop: 2 },
});

// ── Tier Card ─────────────────────────────────────────────────────────────────

function OwnerTierCard({
  tier, C, onEdit,
}: { tier: MemberTier; C: ComponentColors; onEdit: () => void }) {
  const rev = tier.price * tier.subscriberCount;
  return (
    <View style={[tierStyles.card, { backgroundColor: C.surface }]}>
      <View style={tierStyles.cardHeader}>
        <View>
          <Text style={[tierStyles.tierName, { color: C.label }]}>{tier.name}</Text>
          <Text style={[tierStyles.tierPrice, { color: C.secondary }]}>
            {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
          </Text>
        </View>
        <View style={tierStyles.cardHeaderRight}>
          <View>
            <Text style={[tierStyles.subCount, { color: C.label }]}>{tier.subscriberCount}</Text>
            <Text style={[tierStyles.subLabel, { color: C.muted }]}>members</Text>
          </View>
          {tier.price > 0 && (
            <View>
              <Text style={[tierStyles.subCount, { color: '#5A8A6E' }]}>${rev}</Text>
              <Text style={[tierStyles.subLabel, { color: C.muted }]}>mo revenue</Text>
            </View>
          )}
        </View>
      </View>
      {tier.perks.slice(0, 3).map(perk => (
        <View key={perk} style={tierStyles.perkRow}>
          <IconSymbol name="checkmark.circle.fill" size={14} color="#5A8A6E" />
          <Text style={[tierStyles.perkText, { color: C.secondary }]}>{perk}</Text>
        </View>
      ))}
      <Pressable
        style={[tierStyles.editBtn, { borderColor: C.separator }]}
        onPress={onEdit}
      >
        <Text style={[tierStyles.editBtnText, { color: C.accent }]}>Edit Tier</Text>
      </Pressable>
    </View>
  );
}

function VisitorTierCard({ tier, C }: { tier: MemberTier; C: ComponentColors }) {
  const isFree = tier.price === 0;
  return (
    <View style={[tierStyles.card, { backgroundColor: C.surface }]}>
      <View style={tierStyles.cardHeader}>
        <View>
          <Text style={[tierStyles.tierName, { color: C.label }]}>{tier.name}</Text>
          <Text style={[tierStyles.tierPrice, { color: C.secondary }]}>
            {isFree ? 'Free' : `$${tier.price}/mo`}
          </Text>
        </View>
        <Text style={[tierStyles.memberSocial, { color: C.muted }]}>{tier.subscriberCount} members</Text>
      </View>
      {tier.perks.map(perk => (
        <View key={perk} style={tierStyles.perkRow}>
          <IconSymbol name="checkmark.circle.fill" size={14} color="#5A8A6E" />
          <Text style={[tierStyles.perkText, { color: C.secondary }]}>{perk}</Text>
        </View>
      ))}
      <Pressable
        style={[
          tierStyles.subBtn,
          isFree
            ? { borderWidth: 1.5, borderColor: C.label }
            : { backgroundColor: C.accent },
        ]}
      >
        <Text style={[tierStyles.subBtnText, { color: isFree ? C.label : '#fff' }]}>
          {isFree ? 'Follow' : 'Subscribe'}
        </Text>
      </Pressable>
    </View>
  );
}

const tierStyles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderRight: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  tierName: { fontSize: 16, fontWeight: '700' },
  tierPrice: { fontSize: 13, marginTop: 2 },
  subCount: { fontSize: 18, fontWeight: '700' },
  subLabel: { fontSize: 11, marginTop: 1 },
  memberSocial: { fontSize: 13 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  perkText: { fontSize: 13, flex: 1 },
  editBtn: { marginTop: 10, paddingVertical: 9, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  editBtnText: { fontSize: 14, fontWeight: '600' },
  subBtn: { marginTop: 12, paddingVertical: 11, borderRadius: 14, alignItems: 'center' },
  subBtnText: { fontSize: 14, fontWeight: '700' },
});

// ── Subscriber Row ────────────────────────────────────────────────────────────

function SubscriberRow({ sub, C, last }: { sub: typeof HUB_SUBSCRIBERS[0]; C: ComponentColors; last: boolean }) {
  const tierColor = sub.tierId === 'inner-circle' ? C.accent : sub.tierId === 'vip' ? '#1A1714' : C.secondary;
  return (
    <View style={[subStyles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
      <View style={[subStyles.avatar, { backgroundColor: C.surfacePressed }]}>
        <Text style={[subStyles.avatarText, { color: C.label }]}>{sub.initials}</Text>
      </View>
      <View style={subStyles.info}>
        <Text style={[subStyles.name, { color: C.label }]}>{sub.name}</Text>
        <Text style={[subStyles.meta, { color: C.secondary }]}>Since {sub.joinDate}</Text>
      </View>
      <View style={subStyles.right}>
        <View style={[subStyles.tierBadge, { backgroundColor: `${tierColor}22` }]}>
          <Text style={[subStyles.tierBadgeText, { color: tierColor }]}>{getTierName(sub.tierId)}</Text>
        </View>
        <Text style={[subStyles.ltv, { color: C.muted }]}>${sub.lifetimeValue}</Text>
      </View>
    </View>
  );
}

const subStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 13, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  tierBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tierBadgeText: { fontSize: 10, fontWeight: '700' },
  ltv: { fontSize: 11 },
});

// ── Newsletter Row ────────────────────────────────────────────────────────────

function NewsletterRow({ item, C, last, onPress }: {
  item: typeof HUB_NEWSLETTERS[0]; C: ComponentColors; last: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        nlStyles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={nlStyles.info}>
        <Text style={[nlStyles.subject, { color: C.label }]} numberOfLines={1}>{item.subject}</Text>
        <Text style={[nlStyles.preview, { color: C.secondary }]} numberOfLines={1}>{item.preview}</Text>
        <Text style={[nlStyles.meta, { color: C.muted }]}>{item.sentAt} · {item.recipients} recipients</Text>
      </View>
      <View style={nlStyles.stats}>
        <Text style={[nlStyles.rate, { color: '#5A8A6E' }]}>{item.openRate}% open</Text>
        <Text style={[nlStyles.rate, { color: C.secondary }]}>{item.clickRate}% click</Text>
      </View>
    </Pressable>
  );
}

const nlStyles = StyleSheet.create({
  row: { paddingVertical: 14, flexDirection: 'row', gap: 12 },
  info: { flex: 1 },
  subject: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  preview: { fontSize: 13, marginTop: 2 },
  meta: { fontSize: 11, marginTop: 4 },
  stats: { alignItems: 'flex-end', gap: 4 },
  rate: { fontSize: 12, fontWeight: '600' },
});

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return <Text style={[secStyles.title, { color: C.label }]}>{title}</Text>;
}
const secStyles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 },
});

// ── Link Row ──────────────────────────────────────────────────────────────────

function LinkRow({ link, C, last }: { link: HubLink; C: ComponentColors; last: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [
        linkStyles.row,
        { backgroundColor: C.surface },
        pressed && { opacity: 0.8 },
        !last && { marginBottom: 8 },
      ]}
    >
      <IconSymbol name={link.icon as any} size={18} color={C.accent} />
      <Text style={[linkStyles.title, { color: C.label }]} numberOfLines={1}>{link.title}</Text>
      <IconSymbol name="chevron.right" size={14} color={C.muted} />
    </Pressable>
  );
}

const linkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, marginBottom: 8,
  },
  title: { flex: 1, fontSize: 14, fontWeight: '500' },
});

// ── Featured Content Card ─────────────────────────────────────────────────────

function FeaturedCard({ item, C }: { item: typeof HUB_FEATURED[0]; C: ComponentColors }) {
  return (
    <Pressable style={({ pressed }) => [featStyles.card, pressed && { opacity: 0.85 }]}>
      <View style={[featStyles.thumb, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
        <Text style={featStyles.emoji}>{item.thumbEmoji}</Text>
        <View style={featStyles.typeBadge}>
          <Text style={featStyles.typeBadgeText}>{item.type === 'video' ? '▶' : '✦'}</Text>
        </View>
      </View>
      <Text style={[featStyles.title, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
      <Text style={[featStyles.meta, { color: C.muted }]}>{item.viewCount} · {item.timestamp}</Text>
    </Pressable>
  );
}

const featStyles = StyleSheet.create({
  card: { width: 150, marginRight: 12 },
  thumb: { width: 150, height: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  emoji: { fontSize: 32 },
  typeBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 5,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  title: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  meta: { fontSize: 11, marginTop: 3 },
});

// ── Portfolio Card ────────────────────────────────────────────────────────────

function PortfolioCard({ item, C, expanded, onToggle }: {
  item: typeof HUB_PORTFOLIO[0]; C: ComponentColors;
  expanded: boolean; onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[pfStyles.card, { backgroundColor: C.surface }]}
    >
      <View style={[pfStyles.thumb, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
        <Text style={pfStyles.emoji}>{item.thumbEmoji}</Text>
      </View>
      <Text style={[pfStyles.title, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
      <Text style={[pfStyles.category, { color: C.secondary }]}>{item.category} · {item.year}</Text>
      {expanded && (
        <Text style={[pfStyles.description, { color: C.secondary }]}>{item.description}</Text>
      )}
    </Pressable>
  );
}

const pfStyles = StyleSheet.create({
  card: { borderRadius: 14, padding: 12, flex: 1 },
  thumb: { width: '100%', height: 80, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emoji: { fontSize: 28 },
  title: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  category: { fontSize: 11, marginTop: 3 },
  description: { fontSize: 12, lineHeight: 17, marginTop: 8 },
});

// ── Tier Edit Form ────────────────────────────────────────────────────────────

function TierEditForm({ tier, C, onSave, onCancel }: {
  tier: MemberTier; C: ComponentColors;
  onSave: (t: MemberTier) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(tier.name);
  const [price, setPrice] = useState(String(tier.price));
  const [desc, setDesc] = useState(tier.description);
  const [perks, setPerks] = useState(tier.perks.join('\n'));

  return (
    <View style={[editStyles.form, { backgroundColor: C.surface }]}>
      <Text style={[editStyles.formTitle, { color: C.label }]}>Edit Tier</Text>
      <TextInput
        style={[editStyles.input, { color: C.label, borderColor: C.separator }]}
        value={name} onChangeText={setName} placeholder="Tier name"
        placeholderTextColor={C.muted}
      />
      <TextInput
        style={[editStyles.input, { color: C.label, borderColor: C.separator }]}
        value={price} onChangeText={setPrice} placeholder="Price (0 = free)"
        placeholderTextColor={C.muted} keyboardType="numeric"
      />
      <TextInput
        style={[editStyles.input, { color: C.label, borderColor: C.separator }]}
        value={desc} onChangeText={setDesc} placeholder="Description"
        placeholderTextColor={C.muted}
      />
      <TextInput
        style={[editStyles.inputMulti, { color: C.label, borderColor: C.separator }]}
        value={perks} onChangeText={setPerks}
        placeholder="Perks (one per line)" placeholderTextColor={C.muted}
        multiline textAlignVertical="top"
      />
      <View style={editStyles.btnRow}>
        <Pressable style={[editStyles.btn, { borderColor: C.separator, borderWidth: 1 }]} onPress={onCancel}>
          <Text style={[editStyles.btnText, { color: C.secondary }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[editStyles.btn, { backgroundColor: C.accent }]}
          onPress={() => onSave({
            ...tier,
            name, price: parseFloat(price) || 0,
            description: desc,
            perks: perks.split('\n').filter(Boolean),
          })}
        >
          <Text style={[editStyles.btnText, { color: '#fff' }]}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const editStyles = StyleSheet.create({
  form: { borderRadius: 16, padding: 16, marginBottom: 14 },
  formTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 10,
    padding: 12, fontSize: 14, marginBottom: 10,
  },
  inputMulti: {
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 10,
    padding: 12, fontSize: 14, marginBottom: 10, minHeight: 80,
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '600' },
});

// ── Hub Screen ────────────────────────────────────────────────────────────────

export default function HubScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isOwner, setIsOwner] = useState(true);
  const [activeTab, setActiveTab] = useState<HubTab>('Overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('followers');
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(HUB_PROFILE.bio);
  const [editLinks, setEditLinks] = useState(HUB_LINKS);
  const [tiers, setTiers] = useState(HUB_TIERS);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [expandedPortfolioId, setExpandedPortfolioId] = useState<string | null>(null);

  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const topBarH = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + PILL_ROW_H + 8;

  const pills = pillsForTab(activeTab);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const toggleFilterPills = useCallback(() => {
    setFilterPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const handleTabSelect = useCallback((tab: HubTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill(tab === 'Members' ? 'All Tiers' : 'All');
    setFilterPillsVisible(false);
    pillsRevealAnim.setValue(0);
  }, [pillsRevealAnim]);

  // ── Owner Overview ───────────────────────────────────────────────────────────

  const renderOwnerOverview = () => {
    const a = HUB_ANALYTICS;
    const showFollowers = selectedPill === 'All' || selectedPill === 'Followers';
    const showEarnings  = selectedPill === 'All' || selectedPill === 'Earnings';
    const showContent   = selectedPill === 'All' || selectedPill === 'Content';
    const showSubs      = selectedPill === 'All' || selectedPill === 'Subscribers';

    return (
      <ScrollView
        key="owner-overview"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Stats horizontal scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {showFollowers && <StatCard icon="person.2.fill" value={a.followers.toLocaleString()} label="Followers" trend={a.followersTrend} C={C} />}
          {showEarnings  && <StatCard icon="dollarsign.circle.fill" value={`$${a.earnings.toLocaleString()}`} label="Earnings" trend={a.earningsTrend} C={C} />}
          {showContent   && <StatCard icon="eye.fill" value={`${(a.views / 1000).toFixed(1)}K`} label="Views" trend={a.viewsTrend} C={C} />}
          {showSubs      && <StatCard icon="star.fill" value={String(a.subscribers)} label="Subscribers" trend={a.subscribersTrend} C={C} />}
          {(selectedPill === 'All') && <StatCard icon="chart.bar.fill" value={`${a.engagementRate}%`} label="Engagement" trend={a.engagementTrend} C={C} />}
        </ScrollView>

        {/* Bar Chart */}
        <SectionHeader title="Growth" C={C} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {(['followers', 'views', 'earnings'] as ChartMetric[]).map(m => (
            <Pressable
              key={m}
              style={[
                s.metricBtn,
                chartMetric === m ? { backgroundColor: C.label } : { borderColor: C.separator, borderWidth: 1 },
              ]}
              onPress={() => { Haptics.selectionAsync(); setChartMetric(m); }}
            >
              <Text style={[s.metricBtnText, { color: chartMetric === m ? C.bg : C.secondary }]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        <BarChart metric={chartMetric} C={C} />

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" C={C} />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Create Post', icon: 'plus.circle.fill', action: () => router.push('/(tabs)/(main)/social/create' as any) },
            { label: 'Newsletter',  icon: 'envelope.fill',    action: () => router.push('/(tabs)/(main)/hub/newsletter-compose' as any) },
            { label: 'Earnings',    icon: 'dollarsign.circle.fill', action: () => {} },
          ].map(btn => (
            <Pressable
              key={btn.label}
              style={[s.actionBtn, { backgroundColor: C.surface }]}
              onPress={btn.action}
            >
              <IconSymbol name={btn.icon as any} size={20} color={C.accent} />
              <Text style={[s.actionBtnText, { color: C.label }]}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Activity Feed */}
        <SectionHeader title="Recent Activity" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {HUB_ACTIVITY.map((item, idx) => (
            <ActivityRow key={item.id} item={item} C={C} last={idx === HUB_ACTIVITY.length - 1} />
          ))}
        </View>

        {/* Goals */}
        <SectionHeader title="Goals" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {HUB_GOALS.map(goal => <GoalRow key={goal.id} goal={goal} C={C} />)}
        </View>
      </ScrollView>
    );
  };

  // ── Visitor Overview ─────────────────────────────────────────────────────────

  const renderVisitorOverview = () => (
    <ScrollView
      key="visitor-overview"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
    >
      {/* Hero */}
      <View style={s.heroCenter}>
        <View style={[s.heroAvatar, { backgroundColor: `hsl(${HUB_PROFILE.coverHue},42%,28%)` }]}>
          <Text style={s.heroAvatarText}>{HUB_PROFILE.avatarInitials}</Text>
        </View>
        <Text style={[s.heroName, { color: C.label }]}>{HUB_PROFILE.name}</Text>
        <Text style={[s.heroHandle, { color: C.secondary }]}>{HUB_PROFILE.handle}</Text>
        <Text style={[s.heroBio, { color: C.secondary }]}>{bioText}</Text>
        <View style={s.heroLocation}>
          <IconSymbol name="mappin.circle.fill" size={14} color={C.muted} />
          <Text style={[s.heroLocationText, { color: C.muted }]}>{HUB_PROFILE.location}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[s.statsRow, { borderColor: C.separator }]}>
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: C.label }]}>{HUB_PROFILE.followerCount.toLocaleString()}</Text>
          <Text style={[s.statLbl, { color: C.secondary }]}>Followers</Text>
        </View>
        <View style={[s.statDivider, { backgroundColor: C.separator }]} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: C.label }]}>{HUB_PROFILE.postCount}</Text>
          <Text style={[s.statLbl, { color: C.secondary }]}>Posts</Text>
        </View>
      </View>

      {/* CTA buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        <Pressable style={[s.ctaBtn, { backgroundColor: C.label, flex: 1 }]}>
          <Text style={[s.ctaBtnText, { color: C.bg }]}>Follow</Text>
        </Pressable>
        <Pressable style={[s.ctaBtn, { backgroundColor: C.accent, flex: 1 }]}>
          <Text style={[s.ctaBtnText, { color: '#fff' }]}>Subscribe</Text>
        </Pressable>
      </View>

      {/* Links */}
      <SectionHeader title="Links" C={C} />
      {HUB_LINKS.map((link, idx) => (
        <LinkRow key={link.id} link={link} C={C} last={idx === HUB_LINKS.length - 1} />
      ))}

      {/* Recent content */}
      <SectionHeader title="Recent" C={C} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
        {HUB_FEATURED.map(item => (
          <FeaturedCard key={item.id} item={item} C={C} />
        ))}
      </ScrollView>
    </ScrollView>
  );

  // ── Owner Page ───────────────────────────────────────────────────────────────

  const renderOwnerPage = () => {
    const showLinks     = selectedPill === 'All' || selectedPill === 'Links';
    const showPortfolio = selectedPill === 'All' || selectedPill === 'Portfolio';
    const showFeatured  = selectedPill === 'All' || selectedPill === 'Featured';

    return (
      <ScrollView
        key="owner-page"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 120 }}
      >
        {/* Cover strip */}
        <View style={[s.coverStrip, { backgroundColor: `hsl(${HUB_PROFILE.coverHue},42%,30%)` }]}>
          <Text style={s.coverEditHint}>Tap to edit cover</Text>
        </View>

        {/* Name + handle */}
        <View style={[s.pageSection, { marginHorizontal: 16 }]}>
          <Text style={[s.pageName, { color: C.label }]}>{HUB_PROFILE.name}</Text>
          <Text style={[s.pageHandle, { color: C.secondary }]}>{HUB_PROFILE.handle}</Text>
        </View>

        {/* Bio editor */}
        <View style={[s.pageSectionBox, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
          <View style={s.pageSectionHeader}>
            <Text style={[s.pageSectionTitle, { color: C.label }]}>About</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditingBio(v => !v);
              }}
            >
              <Text style={[s.editToggle, { color: C.accent }]}>{editingBio ? 'Save' : 'Edit'}</Text>
            </Pressable>
          </View>
          {editingBio ? (
            <TextInput
              style={[s.bioInput, { color: C.label, borderColor: C.separator }]}
              value={bioText}
              onChangeText={setBioText}
              multiline
              textAlignVertical="top"
              placeholder="Write your bio…"
              placeholderTextColor={C.muted}
            />
          ) : (
            <Text style={[s.bioText, { color: C.secondary }]}>{bioText}</Text>
          )}
        </View>

        {/* Links editor */}
        {showLinks && (
          <View style={{ marginHorizontal: 16, marginTop: 20 }}>
            <SectionHeader title="Links" C={C} />
            {editLinks.map((link, idx) => (
              <View key={link.id} style={[s.editLinkRow, { backgroundColor: C.surface }]}>
                <IconSymbol name={link.icon as any} size={16} color={C.accent} />
                <Text style={[s.editLinkTitle, { color: C.label }]} numberOfLines={1}>{link.title}</Text>
                <Pressable hitSlop={8}>
                  <IconSymbol name="trash" size={16} color={C.muted} />
                </Pressable>
              </View>
            ))}
            <Pressable
              style={[s.addLinkBtn, { borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="plus" size={16} color={C.accent} />
              <Text style={[s.addLinkText, { color: C.accent }]}>Add Link</Text>
            </Pressable>
          </View>
        )}

        {/* Portfolio grid */}
        {showPortfolio && (
          <View style={{ marginHorizontal: 16, marginTop: 20 }}>
            <SectionHeader title="Portfolio" C={C} />
            <View style={s.portfolioGrid}>
              {HUB_PORTFOLIO.map((item) => (
                <View key={item.id} style={s.portfolioCell}>
                  <PortfolioCard
                    item={item}
                    C={C}
                    expanded={expandedPortfolioId === item.id}
                    onToggle={() => setExpandedPortfolioId(expandedPortfolioId === item.id ? null : item.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preview button */}
        <Pressable
          style={[s.previewBtn, { backgroundColor: C.label, marginHorizontal: 16, marginTop: 24 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsOwner(false); }}
        >
          <IconSymbol name="eye.fill" size={16} color={C.bg} />
          <Text style={[s.previewBtnText, { color: C.bg }]}>Preview as Visitor</Text>
        </Pressable>
      </ScrollView>
    );
  };

  // ── Visitor Page ─────────────────────────────────────────────────────────────

  const renderVisitorPage = () => (
    <ScrollView
      key="visitor-page"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 120 }}
    >
      {/* Cover strip */}
      <View style={[s.coverStrip, { backgroundColor: `hsl(${HUB_PROFILE.coverHue},42%,30%)` }]} />

      {/* Portfolio grid */}
      <View style={{ marginHorizontal: 16, marginTop: 16 }}>
        <SectionHeader title="Portfolio" C={C} />
        <View style={s.portfolioGrid}>
          {HUB_PORTFOLIO.map(item => (
            <View key={item.id} style={s.portfolioCell}>
              <PortfolioCard
                item={item}
                C={C}
                expanded={expandedPortfolioId === item.id}
                onToggle={() => setExpandedPortfolioId(expandedPortfolioId === item.id ? null : item.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Featured Content */}
      <View style={{ marginTop: 20 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <SectionHeader title="Featured" C={C} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}>
          {HUB_FEATURED.map(item => (
            <FeaturedCard key={item.id} item={item} C={C} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );

  // ── Owner Members ────────────────────────────────────────────────────────────

  const renderOwnerMembers = () => {
    const isNewsletter = selectedPill === 'Newsletter';
    const filteredTiers = selectedPill === 'All Tiers' || selectedPill === 'All'
      ? tiers
      : selectedPill === 'Free'
        ? tiers.filter(t => t.price === 0)
        : selectedPill === 'Paid'
          ? tiers.filter(t => t.price > 0)
          : tiers;

    return (
      <ScrollView
        key="owner-members"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {isNewsletter ? (
          <>
            <SectionHeader title="Newsletters" C={C} />
            <View style={[s.section, { backgroundColor: C.surface }]}>
              {HUB_NEWSLETTERS.map((item, idx) => (
                <NewsletterRow
                  key={item.id}
                  item={item}
                  C={C}
                  last={idx === HUB_NEWSLETTERS.length - 1}
                  onPress={() => router.push('/(tabs)/(main)/hub/newsletter-compose' as any)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <SectionHeader title="Tiers" C={C} />
            {filteredTiers.map(tier => (
              editingTierId === tier.id ? (
                <TierEditForm
                  key={tier.id}
                  tier={tier}
                  C={C}
                  onSave={updated => {
                    setTiers(prev => prev.map(t => t.id === tier.id ? updated : t));
                    setEditingTierId(null);
                  }}
                  onCancel={() => setEditingTierId(null)}
                />
              ) : (
                <OwnerTierCard
                  key={tier.id}
                  tier={tier}
                  C={C}
                  onEdit={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditingTierId(tier.id); }}
                />
              )
            ))}
            <Pressable
              style={[s.addTierBtn, { borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="plus" size={16} color={C.accent} />
              <Text style={[s.addTierText, { color: C.accent }]}>Create Tier</Text>
            </Pressable>

            <SectionHeader title="Subscribers" C={C} />
            <View style={[s.section, { backgroundColor: C.surface }]}>
              {HUB_SUBSCRIBERS.map((sub, idx) => (
                <SubscriberRow key={sub.id} sub={sub} C={C} last={idx === HUB_SUBSCRIBERS.length - 1} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // ── Visitor Members ──────────────────────────────────────────────────────────

  const renderVisitorMembers = () => (
    <ScrollView
      key="visitor-members"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
    >
      {/* Social proof */}
      <View style={[s.socialProof, { backgroundColor: C.surface }]}>
        <Text style={[s.socialProofNum, { color: C.label }]}>
          {tiers.reduce((sum, t) => sum + t.subscriberCount, 0)} members
        </Text>
        <Text style={[s.socialProofText, { color: C.secondary }]}>already in the community</Text>
      </View>

      {/* Mock current membership */}
      <View style={[s.currentTierCard, { backgroundColor: `${C.accent}18`, borderColor: C.accent }]}>
        <View>
          <Text style={[s.currentTierLabel, { color: C.secondary }]}>Your Membership</Text>
          <Text style={[s.currentTierName, { color: C.label }]}>Supporter</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[s.currentTierRenew, { color: C.muted }]}>Renews Aug 1</Text>
          <Pressable>
            <Text style={[s.manageTierText, { color: C.accent }]}>Manage</Text>
          </Pressable>
        </View>
      </View>

      <SectionHeader title="Membership Tiers" C={C} />
      {tiers.map(tier => (
        <VisitorTierCard key={tier.id} tier={tier} C={C} />
      ))}
    </ScrollView>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (activeTab === 'Overview') return isOwner ? renderOwnerOverview() : renderVisitorOverview();
    if (activeTab === 'Page')     return isOwner ? renderOwnerPage()     : renderVisitorPage();
    return isOwner ? renderOwnerMembers() : renderVisitorMembers();
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {renderContent()}

      {/* ── Fixed Top Bar ── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          {/* Left: hamburger (owner) */}
          <View style={s.topBarSide}>
            {isOwner ? (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
                hitSlop={12}
              >
                <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
              </Pressable>
            ) : null}
          </View>

          {/* Center: dropdown pill */}
          <View style={s.dropdownPillWrap}>
            <Pressable
              style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdownOpen(v => !v); }}
            >
              <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Right: filter icon + owner toggle */}
          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', gap: 10 }]}>
            <Pressable
              style={[s.ownerToggle, { backgroundColor: isOwner ? C.accent : C.surfacePressed }]}
              onPress={() => { Haptics.selectionAsync(); setIsOwner(v => !v); }}
            >
              <Text style={[s.ownerToggleText, { color: isOwner ? '#fff' : C.secondary }]}>
                {isOwner ? 'Owner' : 'Visit'}
              </Text>
            </Pressable>
            <Pressable onPress={toggleFilterPills} hitSlop={12}>
              <IconSymbol
                name={filterPillsVisible || selectedPill !== pills[0]
                  ? 'line.3.horizontal.decrease.circle.fill'
                  : 'line.3.horizontal.decrease.circle'}
                size={22}
                color={filterPillsVisible || selectedPill !== pills[0] ? C.accent : C.label}
              />
            </Pressable>
          </View>
        </View>

        {/* Filter Pills */}
        <Animated.View style={{
          height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
          opacity: pillsRevealAnim,
          overflow: 'hidden',
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillsContent}
            style={[s.pillsRow, { borderTopColor: C.separator }]}
          >
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable
                  key={pill}
                  style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[s.pillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>
                    {pill}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Dropdown ── */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[s.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {(['Overview', 'Page', 'Members'] as HubTab[]).map(tab => (
              <Pressable key={tab} style={s.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[s.dropdownOptionText, { color: tab === activeTab ? C.label : C.secondary }, tab === activeTab && { fontWeight: '600' }]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Compose Newsletter FAB (Members + Owner) ── */}
      {activeTab === 'Members' && isOwner && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(tabs)/(main)/hub/newsletter-compose' as any);
          }}
        >
          <IconSymbol name="envelope.fill" size={20} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },

  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 80, justifyContent: 'center' },

  dropdownPillWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownPillText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  dropdown: {
    position: 'absolute', left: '50%', marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8, overflow: 'hidden',
  },
  dropdownOption: { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionText: { fontSize: 15 },

  pillsRow: { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13 },

  ownerToggle: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  ownerToggleText: { fontSize: 11, fontWeight: '700' },

  section: { borderRadius: 16, padding: 16, marginBottom: 20 },

  // Owner Overview
  metricBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  metricBtnText: { fontSize: 12, fontWeight: '600' },
  actionBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },

  // Visitor Overview
  heroCenter: { alignItems: 'center', paddingTop: 16, paddingBottom: 20 },
  heroAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroAvatarText: { fontSize: 26, fontWeight: '700', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '800', marginBottom: 3 },
  heroHandle: { fontSize: 14, marginBottom: 10 },
  heroBio: { fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 20, marginBottom: 8 },
  heroLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLocationText: { fontSize: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 12, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32 },
  ctaBtn: { paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  ctaBtnText: { fontSize: 15, fontWeight: '700' },

  // Page
  coverStrip: { height: 120, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  coverEditHint: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  pageSection: { marginTop: 14, marginBottom: 10 },
  pageName: { fontSize: 20, fontWeight: '800' },
  pageHandle: { fontSize: 14, marginTop: 2 },
  pageSectionBox: { borderRadius: 14, padding: 14 },
  pageSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pageSectionTitle: { fontSize: 14, fontWeight: '700' },
  editToggle: { fontSize: 14, fontWeight: '600' },
  bioInput: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 10, fontSize: 14, minHeight: 80 },
  bioText: { fontSize: 14, lineHeight: 20 },
  editLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, marginBottom: 8 },
  editLinkTitle: { flex: 1, fontSize: 14 },
  addLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed' },
  addLinkText: { fontSize: 14, fontWeight: '600' },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  portfolioCell: { width: '48%' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 24 },
  previewBtnText: { fontSize: 15, fontWeight: '700' },

  // Members
  addTierBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 24 },
  addTierText: { fontSize: 14, fontWeight: '600' },
  socialProof: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 },
  socialProofNum: { fontSize: 22, fontWeight: '800' },
  socialProofText: { fontSize: 13, marginTop: 2 },
  currentTierCard: { borderRadius: 14, borderWidth: 1.5, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  currentTierLabel: { fontSize: 12 },
  currentTierName: { fontSize: 17, fontWeight: '700', marginTop: 2 },
  currentTierRenew: { fontSize: 12, marginBottom: 4 },
  manageTierText: { fontSize: 13, fontWeight: '600' },

  // FAB
  fab: {
    position: 'absolute', right: 24, width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
  },
});
