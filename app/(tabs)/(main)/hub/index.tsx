/**
 * Personal Hub — Creator backend + public-facing profile.
 * RBAC flip: owner sees analytics/admin tools, visitor sees public profile.
 * Navigation (Dashboard / Content / Analytics) lives in the sidebar — no dropdown.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  Image, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams, Redirect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { RolePill } from '@/components/ui/role-pill';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import { KMenuButton } from '@/components/ui/k-menu-button';
import {
  HUB_PROFILE, HUB_ANALYTICS, HUB_CHART_DATA, HUB_ACTIVITY, HUB_GOALS,
  HUB_TIERS, HUB_LINKS, HUB_PORTFOLIO,
  HUB_FEATURED, CONTENT_ITEMS,
  ANALYTICS_ENGAGEMENT_TREND, ANALYTICS_AUDIENCE, ANALYTICS_HEATMAP,
  ANALYTICS_TOP_CONTENT, ANALYTICS_GROWTH_SOURCES, ANALYTICS_REVENUE,
  ANALYTICS_CONTENT_TYPES, HEATMAP_HOURS, HEATMAP_DAYS,
  ANALYTICS_AGE_DETAIL, ANALYTICS_LOCATION_DETAIL,
  ANALYTICS_GROWTH_DETAIL, ANALYTICS_REVENUE_DETAIL,
  ANALYTICS_CONTENT_DETAIL, ANALYTICS_TYPE_CONTENT,
  getChartMax,
  type ChartMetric, type MemberTier, type HubLink, type ContentItem, type ContentType,
} from '@/data/mock-hub';

const OVERVIEW_PILLS = ['All', 'Followers', 'Earnings', 'Content', 'Subscribers'];
const CONTENT_PILLS  = ['All', 'Posts', 'Reels', 'KTV', 'Stories'];

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

const TOP_BAR_H  = 44;
const PILL_ROW_H = 48;
const BAR_MAX_H  = 100;

const SOCIAL_PLATFORMS = [
  { name: 'Instagram', fa: 'instagram'  },
  { name: 'X',         fa: 'x-twitter' },
  { name: 'TikTok',    fa: 'tiktok'    },
  { name: 'YouTube',   fa: 'youtube'   },
  { name: 'LinkedIn',  fa: 'linkedin'  },
] satisfies { name: string; fa: string }[];

// ── Content Tab Helpers ───────────────────────────────────────────────────────

function getDayOffset(date: Date): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekDays(offset: number): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
  });
}

function getItemsForDate(date: Date, items: ContentItem[]): ContentItem[] {
  const offset = getDayOffset(date);
  return items.filter(i => i.daysFromToday === offset);
}

function contentTypeIcon(type: ContentType): string {
  switch (type) {
    case 'post':  return 'doc.text.fill';
    case 'reel':  return 'film.fill';
    case 'ktv':   return 'play.tv.fill';
    case 'story': return 'camera.circle.fill';
  }
}

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

function formatDayLabel(date: Date): string {
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function formatWeekRange(days: Date[]): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const f = days[0], l = days[6];
  if (f.getMonth() === l.getMonth()) return `${months[f.getMonth()]} ${f.getDate()}–${l.getDate()}`;
  return `${months[f.getMonth()]} ${f.getDate()} – ${months[l.getMonth()]} ${l.getDate()}`;
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

function formatTooltip(value: number, metric: ChartMetric): string {
  if (metric === 'earnings') return `$${value.toLocaleString()}`;
  if (metric === 'views') return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : `${value}`;
  return value.toLocaleString();
}

function BarChart({ metric, C, onLongPress }: { metric: ChartMetric; C: ComponentColors; onLongPress?: () => void }) {
  const max = getChartMax(metric);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <View style={[chartStyles.wrap, { backgroundColor: C.surface }]}>
      <View style={chartStyles.bars}>
        {HUB_CHART_DATA.map((pt, idx) => {
          const h = max > 0 ? Math.round((pt[metric] / max) * BAR_MAX_H) : 4;
          const isActive = activeIdx === idx;
          return (
            <Pressable
              key={pt.label}
              style={chartStyles.barCol}
              onHoverIn={() => setActiveIdx(idx)}
              onHoverOut={() => setActiveIdx(null)}
              onPressIn={() => setActiveIdx(idx)}
              onPressOut={() => setActiveIdx(null)}
              onLongPress={onLongPress}
              delayLongPress={400}
            >
              <Text style={[chartStyles.barValue, { color: isActive ? C.accent : 'transparent' }]}>
                {formatTooltip(pt[metric], metric)}
              </Text>
              <View style={chartStyles.barTrack}>
                <View style={[chartStyles.bar, { height: h, backgroundColor: C.accent }]} />
              </View>
              <Text style={[chartStyles.barLabel, { color: C.muted }]}>{pt.label}</Text>
            </Pressable>
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
  barValue: { fontSize: 9, fontWeight: '700', height: 14, textAlign: 'center' },
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

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return <Text style={[secStyles.title, { color: C.label }]}>{title}</Text>;
}
const secStyles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 },
});

// ── Link Row ──────────────────────────────────────────────────────────────────

function LinkRow({ link, C, last }: { link: HubLink; C: ComponentColors; last: boolean }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        linkStyles.row,
        { backgroundColor: C.surface },
        pressed && { opacity: 0.8 },
        !last && { marginBottom: 8 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (link.route) router.push(link.route as any);
      }}
    >
      <IconSymbol name={link.icon as any} size={18} color={C.accent} />
      <Text style={[linkStyles.title, { color: C.label }]} numberOfLines={1}>{link.title}</Text>
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
      <View style={featStyles.thumb}>
        {item.thumbUri
          ? <Image source={{ uri: item.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <View style={[StyleSheet.absoluteFill, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
              <Text style={[featStyles.emoji, { position: 'absolute', alignSelf: 'center', top: '30%' }]}>{item.thumbEmoji}</Text>
            </View>
        }
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
      {item.thumbUri
        ? <Image source={{ uri: item.thumbUri }} style={pfStyles.thumb} resizeMode="cover" />
        : <View style={[pfStyles.thumb, { backgroundColor: `hsl(${item.thumbHue},42%,28%)` }]}>
            <Text style={pfStyles.emoji}>{item.thumbEmoji}</Text>
          </View>
      }
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

// ── Live Hub View ─────────────────────────────────────────────────────────────

function getLiveHubContent(mode: string) {
  switch (mode) {
    case 'business':
      return {
        name: 'KaNeXT LLC',
        subtitle: 'Miami, FL · kanext.io',
        description: 'KaNeXT builds the operating system for sports, education, business, and community organizations. One platform for every stakeholder.',
        stats: [
          { label: 'Founded', value: '2023' },
          { label: 'Headquarters', value: 'Miami, FL' },
          { label: 'Website', value: 'kanext.io' },
        ],
        actions: ['Contact Us', 'Request Demo'],
        itemsLabel: 'Latest News',
        items: ['KaNeXT OS v2.0 Launch', 'New Partnership Announced', 'Series A Fundraise Open'],
      };
    case 'education':
      return {
        name: 'Lincoln University',
        subtitle: 'Oakland, California · Est. 1919',
        description: 'Accredited by WSCUC. Offering undergraduate and graduate programs in business, health sciences, and more.',
        stats: [
          { label: 'Enrollment', value: '~800 students' },
          { label: 'Programs', value: 'BA, BS, MBA, MS, DBA' },
          { label: 'Tuition', value: '$13,150/year' },
          { label: 'Accreditation', value: 'WSCUC' },
        ],
        actions: ['Apply Now', 'Request Info'],
        itemsLabel: 'Upcoming Events',
        items: ['Open House – Apr 15', 'Info Session – Apr 22', 'Commencement – May 10'],
      };
    case 'community':
      return {
        name: 'International Christian Center LA',
        subtitle: 'Los Angeles, CA',
        description: 'A Spirit-filled community church in Los Angeles. Join us every Sunday and Wednesday.',
        stats: [
          { label: 'Sunday AM', value: '9:00 AM' },
          { label: 'Sunday PM', value: '6:00 PM' },
          { label: 'Wednesday', value: 'Bible Study 7:00 PM' },
        ],
        actions: ["I'm New", 'Plan Your Visit'],
        itemsLabel: 'Upcoming Events',
        items: ['Easter Sunday Service', 'Community Outreach Day', 'Youth Conference 2026'],
      };
    case 'sports':
      return {
        name: "LU Men's Basketball",
        subtitle: 'Lincoln University Oaklanders · 22-8 (14-2 GAAC)',
        description: "Lincoln University Men's Basketball. 2025-26 season in progress.",
        stats: [
          { label: 'Record', value: '22-8' },
          { label: 'Conference', value: '14-2 GAAC' },
          { label: 'Next Game', value: 'Apr 5 vs. Holy Names' },
          { label: 'Location', value: 'Oakland, CA' },
        ],
        actions: ['View Schedule', 'See Roster'],
        itemsLabel: 'Recent Results',
        items: ['W 78-65 vs. Dominican', 'W 91-72 vs. Menlo', 'L 74-80 @ Cal Maritime', 'W 85-70 vs. Bethesda', 'W 77-68 vs. Simpson'],
      };
    default: // personal
      return {
        name: 'Sammy Kalejaiye',
        subtitle: 'Creator · Founder · Builder',
        description: 'Founder of KaNeXT. Building the OS for institutions. Follow for updates on sports technology, AI, and institutional intelligence.',
        stats: [
          { label: 'Followers', value: '12.4K' },
          { label: 'Posts', value: '247' },
        ],
        actions: ['Follow'],
        itemsLabel: 'Recent Posts',
        items: ['KaNeXT OS v2 is here', 'The future of sports analytics', 'Lincoln University x KaNeXT partnership', 'Why institutional intelligence matters'],
      };
  }
}

function LiveHubView({ mode, C, insets }: { mode: string; C: ComponentColors; insets: any }) {
  const content = getLiveHubContent(mode);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 20 }}>
        {/* Header */}
        <View style={{ gap: 4, paddingTop: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: C.label }}>{content.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary }}>{content.subtitle}</Text>
        </View>
        {/* Profile/overview card */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 20 }}>{content.description}</Text>
          {content.stats.map((s: any) => (
            <View key={s.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: C.secondary }}>{s.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{s.value}</Text>
            </View>
          ))}
        </View>
        {/* Action buttons */}
        {content.actions.map((a: any) => (
          <Pressable key={a} style={{ backgroundColor: C.label, borderRadius: 12, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.bg }}>{a}</Text>
          </Pressable>
        ))}
        {/* Recent posts / links */}
        {content.items && content.items.length > 0 && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{content.itemsLabel}</Text>
            {content.items.map((item: any) => (
              <View key={item} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
                <Text style={{ fontSize: 14, color: C.label }}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Line Chart ────────────────────────────────────────────────────────────────

function LineChart({ data, color, height = 72, interactive = false, tooltipBg, tooltipText, labels }: {
  data: number[]; color: string; height?: number;
  interactive?: boolean; tooltipBg?: string; tooltipText?: string;
  labels?: string[];
}) {
  const [width, setWidth] = React.useState(0);
  const [tooltipIdx, setTooltipIdx] = React.useState<number | null>(null);

  if (data.length < 2) return <View style={{ height }} onLayout={e => setWidth(e.nativeEvent.layout.width)} />;
  const min  = Math.min(...data);
  const max  = Math.max(...data);
  const rng  = max - min || 1;
  const pts  = data.map((v, i) => ({
    x: width > 0 ? (i / (data.length - 1)) * width : 0,
    y: height - ((v - min) / rng) * (height - 6) - 3,
  }));

  const handleTouch = (x: number) => {
    if (width <= 0) return;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((x / width) * (data.length - 1))));
    setTooltipIdx(idx);
  };

  return (
    <View style={{ height }} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && pts.slice(1).map((pt, i) => {
        const prev = pts[i];
        const dx = pt.x - prev.x, dy = pt.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ang = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View key={i} style={{
            position: 'absolute',
            left: (prev.x + pt.x) / 2 - len / 2,
            top:  (prev.y + pt.y) / 2 - 1,
            width: len, height: 2,
            backgroundColor: color,
            transform: [{ rotate: `${ang}deg` }],
          }} />
        );
      })}
      {interactive && tooltipIdx !== null && width > 0 && (
        <>
          <View style={{
            position: 'absolute',
            left: pts[tooltipIdx].x,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: color,
            opacity: 0.4,
          }} />
          <View style={{
            position: 'absolute',
            left: pts[tooltipIdx].x - 4,
            top: pts[tooltipIdx].y - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
          }} />
          <View style={{
            position: 'absolute',
            left: Math.max(0, Math.min(width - 90, pts[tooltipIdx].x - 45)),
            top: -36,
            backgroundColor: tooltipBg ?? color,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            zIndex: 10,
          }}>
            <Text style={{ color: tooltipText ?? '#fff', fontSize: 11, fontWeight: '700' }}>
              {data[tooltipIdx].toFixed(1)}%{'  '}{labels?.[tooltipIdx] ?? ''}
            </Text>
          </View>
        </>
      )}
      {interactive && width > 0 && (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={e => handleTouch(e.nativeEvent.locationX)}
          onResponderMove={e => handleTouch(e.nativeEvent.locationX)}
          onResponderRelease={() => setTooltipIdx(null)}
        />
      )}
    </View>
  );
}

// ── Hub Screen ────────────────────────────────────────────────────────────────

export default function HubScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'personal';
  const dataMode = useDataMode();

  const [role, cycleRole, roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];

  // ── Non-personal mode roles ──────────────────────────────────────────────────
  const [bizRole,    bizCycleRole,    bizRoleCycles]    = useDemoRole('business:hub');
  const isBizAdmin = bizRole === bizRoleCycles[0];
  const [eduRole,    eduCycleRole,    eduRoleCycles]    = useDemoRole('education:hub');
  const isEduAdmin = eduRole === eduRoleCycles[0];
  const [comRole,    comCycleRole,    comRoleCycles]    = useDemoRole('community:hub');
  const isComAdmin = comRole === comRoleCycles[0];
  const [sportsRole, sportsCycleRole, sportsRoleCycles] = useDemoRole('sports:hub');
  const isSportsAdmin = sportsRole === sportsRoleCycles[0];

  // ── Tab state ─────────────────────────────────────────────────────────────────
  type HubTab = 'Profile' | 'Content' | 'Analytics';
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<HubTab>('Profile');
  useEffect(() => { if (!isOwner) setActiveTab('Profile'); }, [isOwner]);
  useEffect(() => {
    if (!isOwner) return;
    const t = params.tab;
    if (t === 'Content' || t === 'Analytics') setActiveTab(t);
    else setActiveTab('Profile');
  }, [params.tab, isOwner]);

  // ── Tab state for non-personal modes ────────────────────────────────────────
  const [bizTab,    setBizTab]    = useState<'Overview' | 'Projects' | 'Documents'>('Overview');
  const [eduTab,    setEduTab]    = useState<'Overview' | 'Courses' | 'Student Life'>('Overview');
  const [comTab,    setComTab]    = useState<'Overview' | 'Services' | 'Groups'>('Overview');
  const [sportsTab, setSportsTab] = useState<'Overview' | 'Film Room' | 'Scouting' | 'Game Day'>('Overview');
  useEffect(() => { if (!isBizAdmin && bizTab === 'Documents') setBizTab('Overview'); }, [isBizAdmin, bizTab]);
  useEffect(() => { if (!isComAdmin && comTab === 'Groups') setComTab('Overview'); }, [isComAdmin, comTab]);
  useEffect(() => { if (!isSportsAdmin && (sportsTab === 'Scouting' || sportsTab === 'Game Day')) setSportsTab('Overview'); }, [isSportsAdmin, sportsTab]);
  const [selectedPill, setSelectedPill] = useState('All');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('followers');
  const [bioText] = useState(HUB_PROFILE.bio);

  const [tiers] = useState(HUB_TIERS);
  const [expandedPortfolioId, setExpandedPortfolioId] = useState<string | null>(null);

  // ── Analytics tab state ──────────────────────────────────────────────────────
  const [engPeriod,         setEngPeriod]         = useState<'7d'|'30d'|'90d'>('30d');
  const [topMetric,         setTopMetric]         = useState<'reach'|'engagement'|'revenue'>('reach');
  const [hmTooltip,         setHmTooltip]         = useState<{day:number;slot:number}|null>(null);
  const [expandedAge,       setExpandedAge]       = useState<string | null>(null);
  const [expandedLocation,  setExpandedLocation]  = useState<string | null>(null);
  const [expandedGrowthSrc, setExpandedGrowthSrc] = useState<string | null>(null);
  const [expandedRevSrc,    setExpandedRevSrc]    = useState<string | null>(null);
  const [expandedContent,   setExpandedContent]   = useState<string | null>(null);
  const [expandedContentType, setExpandedContentType] = useState<string | null>(null);

  // ── Content tab state ────────────────────────────────────────────────────────
  const [calView,       setCalView]       = useState<'week' | 'month'>('week');
  const [weekOffset,    setWeekOffset]    = useState(0);
  const [selectedCalDay, setSelectedCalDay] = useState<Date>(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [contentSearch, setContentSearch] = useState('');
  const [showComposer,  setShowComposer]  = useState(false);

  const lastScrollY = useRef(0);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (mode === 'sports') {
      router.replace(isSportsAdmin
        ? '/(tabs)/(main)/hub/sports-program-overview' as any
        : '/(tabs)/(main)/hub/sports-player-dashboard' as any
      );
    }
  }, [mode, isSportsAdmin]));

  // ── Sports mode: render nothing while redirect fires ─────────────────────────
  if (mode === 'sports') return null;

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);


  if (dataMode === 'live') return <LiveHubView mode={mode} C={C} insets={insets} />;

  const topBarH = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;

  // ── Owner Dashboard ───────────────────────────────────────────────────────────

  const renderOwnerDashboard = () => {
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
            { label: 'New Content', icon: 'calendar',          action: () => router.push('/(tabs)/(main)/hub/newsletter-compose' as any) },
            { label: 'View Earnings', icon: 'dollarsign.circle.fill', action: () => {} },
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

  // ── Owner Profile (public-facing creator profile) ────────────────────────────

  const PROFILE_FEATURED = [
    { type: 'VIDEO',   title: 'KaNeXT OS v2.0 — Full Walkthrough',    meta: '12.4K views'   },
    { type: 'PRODUCT', title: 'Sports Intelligence Playbook',          meta: '$29 · 847 sold' },
    { type: 'POST',    title: 'Why every institution needs an OS',     meta: '2.1K likes'    },
  ];

  const PROFILE_TIERS = [
    { id: 'free',         name: 'Free',         price: 0,  desc: 'Public posts, basic profile',                    members: 1000 },
    { id: 'supporter',    name: 'Supporter',    price: 10, desc: 'Exclusive content, monthly Q&A',                 members: 197  },
    { id: 'inner-circle', name: 'Inner Circle', price: 25, desc: 'DM access, early releases, live sessions',       members: 50   },
  ];

  const PROFILE_LINKS = [
    { icon: 'globe',                    title: 'KaNeXT Product Demo',      url: 'kanext.io/demo'       },
    { icon: 'calendar.badge.plus',      title: 'Book a Coaching Session',  url: 'kanext.io/book'       },
    { icon: 'envelope.fill',            title: 'My Newsletter',            url: 'kanext.io/newsletter' },
    { icon: 'play.rectangle.fill',      title: 'Latest KTV Video',         url: 'kanext.io/ktv'        },
  ];

  const COVER_H = 220 + contentPaddingTop;
  const AVATAR_SIZE = 80;
  const AVATAR_OVERLAP = AVATAR_SIZE / 2;

  const renderOwnerProfile = (viewerIsOwner = true) => (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 0, paddingBottom: 120 }}
    >
      {/* ── 1. Cover + Avatar ── */}
      <View style={{ position: 'relative', marginBottom: AVATAR_OVERLAP + 12 }}>
        {/* Cover image */}
        <Pressable disabled={!viewerIsOwner}>
          <View style={{ height: COVER_H, backgroundColor: C.surface, overflow: 'hidden' }}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/kanext-city/900/500' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {/* bottom scrim for avatar area */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.20)' }} />
            {viewerIsOwner && (
              <View style={{ position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <IconSymbol name="camera.fill" size={12} color="#fff" />
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Edit Cover</Text>
              </View>
            )}
          </View>
        </Pressable>
        {/* Nav row — scrolls with cover */}
        <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0, height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, zIndex: 2 }}>
          <View style={{ width: 44, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isOwner) openSidePanel(); }} hitSlop={12}>
              <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: '#fff' }}>K</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>@sammyk</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>

        {/* Profile photo — overlapping */}
        <View style={{ position: 'absolute', bottom: -AVATAR_OVERLAP, left: 20 }}>
          <Pressable disabled={!viewerIsOwner}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/kanext-avatar/200/200' }}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 3, borderColor: C.bg }}
              resizeMode="cover"
            />
            {viewerIsOwner && (
              <View style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg }}>
                <IconSymbol name="camera.fill" size={11} color={C.bg} />
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* ── 2. Identity ── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginBottom: 2 }}>Sammy Kalejaiye</Text>
        <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 8 }}>@sammyk</Text>
        <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, opacity: 0.85 }}>
          {"Building the operating system for institutions. Founder of KaNeXT. Sports. Education. Business. Community."}
        </Text>
      </View>

      {/* ── 3. Social proof + Primary action ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 }}>
        <Text style={{ fontSize: 14, color: C.secondary }}>
          <Text style={{ fontWeight: '700', color: C.label }}>1,247</Text>{' followers'}
        </Text>
        {viewerIsOwner ? (
          <Pressable style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit Profile</Text>
          </Pressable>
        ) : (
          <Pressable style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: C.activePill }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.activePillText }}>Follow</Text>
          </Pressable>
        )}
      </View>

      {/* ── 4. Social links row ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.separator, marginBottom: 28 }}>
        {SOCIAL_PLATFORMS.map(platform => (
          <Pressable key={platform.name} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesome6 name={platform.fa as any} size={18} color={C.label} iconStyle="brands" />
            </View>
          </Pressable>
        ))}
      </View>

      {/* ── 5. FEATURED ── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>Featured</Text>
        {PROFILE_FEATURED.map(item => (
          <Pressable
            key={item.title}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8, gap: 12 }, pressed && { opacity: 0.75 }]}
          >
            <View style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: C.separator, borderRadius: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: C.secondary, letterSpacing: 0.5 }}>{item.type}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{item.meta}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* ── 6. SUBSCRIBE ── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>Subscribe</Text>
        {PROFILE_TIERS.map(t => (
          <View key={t.id} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{t.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{t.price === 0 ? 'Free' : `$${t.price}/mo`}</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18, marginBottom: 10 }}>{t.desc}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: C.muted }}>{t.members.toLocaleString()} members</Text>
              {t.id !== 'free' && (
                viewerIsOwner ? (
                  <Pressable style={{ borderWidth: 1.5, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Edit Tier</Text>
                  </Pressable>
                ) : (
                  <Pressable style={{ backgroundColor: C.activePill, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.activePillText }}>Subscribe</Text>
                  </Pressable>
                )
              )}
            </View>
          </View>
        ))}
      </View>

      {/* ── 7. LINKS ── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>Links</Text>
          {viewerIsOwner && (
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name="plus" size={14} color={C.label} />
            </Pressable>
          )}
        </View>
        {PROFILE_LINKS.map(link => (
          <Pressable
            key={link.title}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8, gap: 12 }, pressed && { opacity: 0.75 }]}
          >
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name={link.icon as any} size={16} color={C.label} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{link.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{link.url}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  // ── Visitor Dashboard ─────────────────────────────────────────────────────────

  const renderVisitorDashboard = () => (
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

  // ── Owner Content Tab ────────────────────────────────────────────────────────

  const renderOwnerContent = () => {
    const weekDays   = getWeekDays(weekOffset);
    const weekLabel  = formatWeekRange(weekDays);
    const selDayItems = getItemsForDate(selectedCalDay, CONTENT_ITEMS);

    const upNext = CONTENT_ITEMS
      .filter(i => i.status === 'scheduled' && i.daysFromToday !== null && i.daysFromToday >= 0)
      .sort((a, b) => (a.daysFromToday ?? 0) - (b.daysFromToday ?? 0))
      .slice(0, 5);

    const drafts = CONTENT_ITEMS.filter(i => i.status === 'draft');

    const typeFilterMap: Record<string, ContentType | null> = {
      All: null, Posts: 'post', Reels: 'reel', KTV: 'ktv', Stories: 'story',
    };
    const typeFilter = typeFilterMap[selectedPill] ?? null;
    const library = CONTENT_ITEMS
      .filter(i => i.status === 'published')
      .filter(i => !typeFilter || i.type === typeFilter)
      .filter(i => !contentSearch || i.title.toLowerCase().includes(contentSearch.toLowerCase()))
      .sort((a, b) => (a.daysFromToday ?? 0) - (b.daysFromToday ?? 0));

    const statusColor = (s: string) => s === 'published' ? GAIN : s === 'scheduled' ? CAUTION : C.separator;
    const statusLabel = (s: string) => s === 'published' ? 'Published' : s === 'scheduled' ? 'Scheduled' : 'Draft';

    return (
      <ScrollView
        key="owner-content"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* ── Calendar ── */}
        <SectionHeader title="Content Calendar" C={C} />
        <View style={[cs.card, { backgroundColor: C.surface }]}>
          {/* Header row */}
          <View style={cs.calHeader}>
            <View style={cs.toggleRow}>
              {(['week', 'month'] as const).map(v => (
                <Pressable key={v} style={[cs.viewToggle, calView === v && { backgroundColor: C.label }]}
                  onPress={() => setCalView(v)}>
                  <Text style={[cs.viewToggleText, { color: calView === v ? C.bg : C.secondary }]}>
                    {v === 'week' ? 'Week' : 'Month'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={cs.navRow}>
              <Pressable onPress={() => setWeekOffset(w => w - 1)} hitSlop={10}>
                <IconSymbol name="chevron.left" size={14} color={C.secondary} />
              </Pressable>
              <Text style={[cs.weekLabel, { color: C.secondary }]}>{weekLabel}</Text>
              <Pressable onPress={() => setWeekOffset(w => w + 1)} hitSlop={10}>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </Pressable>
            </View>
          </View>

          {/* Week cells */}
          <View style={cs.weekRow}>
            {weekDays.map((day, idx) => {
              const items     = getItemsForDate(day, CONTENT_ITEMS);
              const isSelected = isSameDay(day, selectedCalDay);
              const isToday   = getDayOffset(day) === 0;
              const hasPub    = items.some(i => i.status === 'published');
              const hasSch    = items.some(i => i.status === 'scheduled');
              const DAY_NAMES = ['M','T','W','T','F','S','S'];
              return (
                <Pressable key={idx} style={cs.dayCell}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCalDay(day); }}>
                  <Text style={[cs.dayName, { color: C.muted }]}>{DAY_NAMES[idx]}</Text>
                  <View style={[
                    cs.dayNumCircle,
                    isSelected && { backgroundColor: C.label },
                    isToday && !isSelected && { borderWidth: 1.5, borderColor: C.label },
                  ]}>
                    <Text style={[cs.dayNumText, { color: isSelected ? C.bg : C.label }]}>{day.getDate()}</Text>
                  </View>
                  <View style={cs.dotRow}>
                    {hasPub && <View style={[cs.dot, { backgroundColor: GAIN }]} />}
                    {hasSch && <View style={[cs.dot, { backgroundColor: CAUTION }]} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Selected day expanded */}
          {selDayItems.length > 0 && (
            <View style={[cs.dayExpanded, { borderTopColor: C.separator }]}>
              <Text style={[cs.dayExpandedLabel, { color: C.secondary }]}>{formatDayLabel(selectedCalDay)}</Text>
              {selDayItems.map((item, idx) => (
                <View key={item.id} style={[cs.dayItemRow, idx < selDayItems.length - 1 && { borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <View style={[cs.typeIconCircle, { backgroundColor: C.bg }]}>
                    <IconSymbol name={contentTypeIcon(item.type) as any} size={14} color={C.label} />
                  </View>
                  <Text style={[cs.dayItemTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
                  <View style={[cs.statusPill, { backgroundColor: statusColor(item.status) + '22' }]}>
                    <Text style={[cs.statusPillText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
                  </View>
                  {item.time && <Text style={[cs.dayItemTime, { color: C.muted }]}>{item.time}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Up Next ── */}
        <SectionHeader title="Up Next" C={C} />
        {upNext.map(item => (
          <Pressable key={item.id} style={[cs.upNextCard, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[cs.typeIconCircle, { backgroundColor: C.bg, width: 40, height: 40 }]}>
              <IconSymbol name={contentTypeIcon(item.type) as any} size={18} color={C.label} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[cs.upNextTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[cs.upNextMeta, { color: C.secondary }]}>
                {item.destination}  ·  {item.daysFromToday === 0 ? 'Today' : item.daysFromToday === 1 ? 'Tomorrow' : `in ${item.daysFromToday}d`}  ·  {item.time}
              </Text>
            </View>
            <View style={[cs.statusPill, { backgroundColor: CAUTION + '22' }]}>
              <Text style={[cs.statusPillText, { color: CAUTION }]}>Scheduled</Text>
            </View>
          </Pressable>
        ))}

        {/* ── Drafts ── */}
        {drafts.length > 0 && (
          <>
            <SectionHeader title="Drafts" C={C} />
            <View style={[cs.card, { backgroundColor: C.surface }]}>
              {drafts.map((item, idx) => (
                <Pressable key={item.id}
                  style={[cs.draftRow, idx < drafts.length - 1 && { borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <View style={[cs.typeIconCircle, { backgroundColor: C.bg }]}>
                    <IconSymbol name={contentTypeIcon(item.type) as any} size={14} color={C.label} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[cs.draftTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[cs.draftMeta, { color: C.muted }]}>Edited {item.lastEdited}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* ── Content Library ── */}
        <SectionHeader title="Content Library" C={C} />
        <View style={[cs.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={14} color={C.muted} />
          <TextInput
            value={contentSearch}
            onChangeText={setContentSearch}
            placeholder="Search content..."
            placeholderTextColor={C.muted}
            style={[cs.searchInput, { color: C.label }]}
          />
          {contentSearch.length > 0 && (
            <Pressable onPress={() => setContentSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={14} color={C.muted} />
            </Pressable>
          )}
        </View>

        {library.length === 0
          ? <Text style={[cs.emptyText, { color: C.muted }]}>No published content yet.</Text>
          : library.map(item => (
            <Pressable key={item.id} style={[cs.libraryRow, { backgroundColor: C.surface }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={[cs.thumbPlaceholder, { backgroundColor: C.bg }]}>
                <IconSymbol name={contentTypeIcon(item.type) as any} size={18} color={C.label} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[cs.libraryTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[cs.libraryMeta, { color: C.secondary }]}>
                  {item.destination}  ·  {item.views ? formatViews(item.views) + ' views' : ''}
                  {item.engagement ? '  ·  ' + item.engagement + ' engagements' : ''}
                </Text>
              </View>
            </Pressable>
          ))
        }
      </ScrollView>
    );
  };

  // ── Owner Page ───────────────────────────────────────────────────────────────

  // ── Visitor Page ─────────────────────────────────────────────────────────────

  const renderVisitorPage = () => renderOwnerProfile(false);

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

  // ── Owner Analytics ──────────────────────────────────────────────────────────

  const renderOwnerAnalytics = () => {
    const engData   = ANALYTICS_ENGAGEMENT_TREND.slice(engPeriod === '7d' ? -7 : engPeriod === '30d' ? -30 : -90);
    const curRate   = engData[engData.length - 1];
    const prevRate  = engData[0];
    const trendUp   = curRate >= prevRate;
    const trendPct  = Math.abs(((curRate - prevRate) / prevRate) * 100).toFixed(1);
    const bestRevIdx = ANALYTICS_CONTENT_TYPES.reduce((bi, ct, i) => ct.revenue > ANALYTICS_CONTENT_TYPES[bi].revenue ? i : bi, 0);

    const topSorted = [...ANALYTICS_TOP_CONTENT].sort((a, b) =>
      topMetric === 'reach' ? b.reach - a.reach :
      topMetric === 'engagement' ? b.engRate - a.engRate :
      b.revenue - a.revenue
    );

    return (
      <ScrollView
        key="owner-analytics"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 70 }}
      >
        {/* ── Engagement ── */}
        <SectionHeader title="Engagement" C={C} />
        <View style={[as.card, { backgroundColor: C.surface }]}>
          <View style={as.engHeaderRow}>
            <View>
              <Text style={[as.bigRate, { color: C.label }]}>{curRate.toFixed(1)}%</Text>
              <View style={as.trendRow}>
                <IconSymbol name={trendUp ? 'arrow.up.right' : 'arrow.down.right'} size={12} color={trendUp ? GAIN : '#B85C5C'} />
                <Text style={[as.trendText, { color: trendUp ? GAIN : '#B85C5C' }]}>{trendPct}% vs {engPeriod} ago</Text>
              </View>
            </View>
            <View style={as.periodPills}>
              {(['7d','30d','90d'] as const).map(p => (
                <Pressable key={p} style={[as.periodPill, engPeriod === p && { backgroundColor: C.label }]}
                  onPress={() => setEngPeriod(p)}>
                  <Text style={[as.periodPillText, { color: engPeriod === p ? C.bg : C.secondary }]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          {(() => {
            const today = new Date();
            const engLabels = engData.map((_, i) => {
              const d = new Date(today);
              d.setDate(d.getDate() - (engData.length - 1 - i));
              return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            return (
              <LineChart data={engData} color={C.label} height={72} interactive
                tooltipBg={C.label} tooltipText={C.bg} labels={engLabels} />
            );
          })()}
          <View style={as.chartAxisRow}>
            <Text style={[as.axisLabel, { color: C.muted }]}>{engPeriod === '7d' ? '7d ago' : engPeriod === '30d' ? '30d ago' : '90d ago'}</Text>
            <Text style={[as.axisLabel, { color: C.muted }]}>Today</Text>
          </View>
        </View>

        {/* ── Audience ── */}
        <SectionHeader title="Audience" C={C} />
        <View style={[as.card, { backgroundColor: C.surface }]}>
          {/* Age bars */}
          <Text style={[as.subHeader, { color: C.secondary }]}>Age Range</Text>
          {ANALYTICS_AUDIENCE.ages.map(a => {
            const ageExpanded = expandedAge === a.range;
            const ageDetail = ANALYTICS_AGE_DETAIL[a.range];
            return (
              <Pressable key={a.range} onPress={() => setExpandedAge(ageExpanded ? null : a.range)}>
                <View style={as.ageRow}>
                  <Text style={[as.ageLabel, { color: C.secondary }]}>{a.range}</Text>
                  <View style={[as.barTrackH, { backgroundColor: C.separator }]}>
                    <View style={[as.barFillH, { width: `${a.pct}%`, backgroundColor: C.label }]} />
                  </View>
                  <Text style={[as.agePct, { color: C.label }]}>{a.pct}%</Text>
                </View>
                {ageExpanded && ageDetail && (
                  <View style={{ paddingTop: 8, gap: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Followers: {ageDetail.followers}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Engagement: {ageDetail.engPct}% of total</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, fontStyle: 'italic' }}>Top content: {ageDetail.topContent}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Gender */}
          <View style={[as.divider, { backgroundColor: C.separator }]} />
          <Text style={[as.subHeader, { color: C.secondary }]}>Gender</Text>
          <Text style={[as.genderText, { color: C.label }]}>
            {ANALYTICS_AUDIENCE.gender.male}% Male  ·  {ANALYTICS_AUDIENCE.gender.female}% Female  ·  {ANALYTICS_AUDIENCE.gender.other}% Other
          </Text>

          {/* Locations */}
          <View style={[as.divider, { backgroundColor: C.separator }]} />
          <Text style={[as.subHeader, { color: C.secondary }]}>Top Locations</Text>
          {ANALYTICS_AUDIENCE.locations.map((loc, i) => {
            const locExpanded = expandedLocation === loc.city;
            const locDetail = ANALYTICS_LOCATION_DETAIL[loc.city];
            return (
              <Pressable key={loc.city} onPress={() => setExpandedLocation(locExpanded ? null : loc.city)}>
                <View style={as.locationRow}>
                  <Text style={[as.locationRank, { color: C.muted }]}>{i + 1}</Text>
                  <Text style={[as.locationCity, { color: C.label }]}>{loc.city}</Text>
                  <Text style={[as.locationPct,  { color: C.secondary }]}>{loc.pct}%</Text>
                </View>
                {locExpanded && locDetail && (
                  <View style={{ paddingTop: 4, paddingBottom: 4, gap: 2, paddingLeft: 26 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Followers: {locDetail.followers}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Eng rate: {locDetail.engRate}%</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── Best Times ── */}
        <SectionHeader title="Best Times to Post" C={C} />
        <View style={[as.card, { backgroundColor: C.surface }]}>
          {/* Hour labels */}
          <View style={as.hmHeaderRow}>
            <View style={{ width: 32 }} />
            {HEATMAP_HOURS.map(h => (
              <Text key={h} style={[as.hmHourLabel, { color: C.muted }]}>{h}</Text>
            ))}
          </View>
          {/* Rows */}
          {ANALYTICS_HEATMAP.map((row, di) => (
            <View key={di} style={as.hmRow}>
              <Text style={[as.hmDayLabel, { color: C.secondary }]}>{HEATMAP_DAYS[di]}</Text>
              {row.map((val, si) => {
                const active = hmTooltip?.day === di && hmTooltip?.slot === si;
                return (
                  <Pressable key={si}
                    style={[as.hmCell, { backgroundColor: C.surface }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setHmTooltip(active ? null : { day: di, slot: si });
                    }}
                  >
                    <View style={[as.hmCellFill, { backgroundColor: C.label, opacity: 0.04 + (val / 100) * 0.88 }]} />
                    {active && (
                      <View style={[as.hmTooltip, { backgroundColor: C.label }]}>
                        <Text style={[as.hmTooltipText, { color: C.bg }]}>{val}%</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
          <Text style={[as.hmFooter, { color: C.muted }]}>Darker = higher engagement</Text>
        </View>

        {/* ── Top Content ── */}
        <SectionHeader title="Top Content" C={C} />
        <View style={as.topMetricPills}>
          {(['reach','engagement','revenue'] as const).map(m => (
            <Pressable key={m} style={[as.metricPill, topMetric === m && { backgroundColor: C.label }]}
              onPress={() => setTopMetric(m)}>
              <Text style={[as.metricPillText, { color: topMetric === m ? C.bg : C.secondary }]}>
                {m === 'reach' ? 'By Reach' : m === 'engagement' ? 'By Engagement' : 'By Revenue'}
              </Text>
            </Pressable>
          ))}
        </View>
        {topSorted.map((item, idx) => {
          const tcExpanded = expandedContent === item.id;
          const tcDetail = ANALYTICS_CONTENT_DETAIL[item.id];
          const tcEngRate = tcDetail
            ? ((tcDetail.likes + tcDetail.comments + tcDetail.shares + tcDetail.saves) / tcDetail.views * 100)
            : item.engRate;
          return (
            <Pressable
              key={item.id}
              style={[as.topCard, { backgroundColor: C.surface, flexDirection: 'column', alignItems: 'flex-start' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedContent(tcExpanded ? null : item.id);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' }}>
                <View style={as.topRankCircle}>
                  <Text style={[as.topRank, { color: C.secondary }]}>{idx + 1}</Text>
                </View>
                <View style={[as.topThumb, { backgroundColor: C.bg }]}>
                  <IconSymbol name={contentTypeIcon(item.type) as any} size={16} color={C.label} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[as.topTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[as.topMeta, { color: C.secondary }]}>{item.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={[as.topValue, { color: C.label }]}>
                    {topMetric === 'reach' ? formatViews(item.reach) + ' views' :
                     topMetric === 'engagement' ? item.engRate.toFixed(1) + '%' :
                     '$' + item.revenue}
                  </Text>
                  <View style={[as.typeBadge, { backgroundColor: C.bg }]}>
                    <Text style={[as.typeBadgeText, { color: C.secondary }]}>{item.type.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              {tcExpanded && tcDetail && (
                <View style={{ paddingTop: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 8, width: '100%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {[
                      { label: 'Views',    value: formatViews(tcDetail.views) },
                      { label: 'Likes',    value: formatViews(tcDetail.likes) },
                      { label: 'Comments', value: formatViews(tcDetail.comments) },
                      { label: 'Shares',   value: formatViews(tcDetail.shares) },
                      { label: 'Saves',    value: formatViews(tcDetail.saves) },
                    ].map(stat => (
                      <View key={stat.label} style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{stat.value}</Text>
                        <Text style={{ fontSize: 11, color: C.muted }}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: C.secondary }}>Eng Rate</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: tcEngRate > 8 ? GAIN : '#B85C5C' }}>
                      {tcEngRate.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: C.secondary }}>Revenue</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>${item.revenue}</Text>
                  </View>
                  <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 13, color: C.accent }}>View Post →</Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* ── Growth Sources ── */}
        <SectionHeader title="Where Followers Come From" C={C} />
        <View style={[as.card, { backgroundColor: C.surface }]}>
          {ANALYTICS_GROWTH_SOURCES.map((src, i) => {
            const growthExpanded = expandedGrowthSrc === src.label;
            const growthDetail = ANALYTICS_GROWTH_DETAIL[src.label];
            const trendColor = growthDetail?.trend === 'up' ? GAIN : growthDetail?.trend === 'down' ? '#B85C5C' : C.secondary;
            const trendIcon = growthDetail?.trend === 'up' ? 'arrow.up.right' : growthDetail?.trend === 'down' ? 'arrow.down.right' : 'minus';
            const trendLabel = growthDetail?.trend === 'up' ? 'Growing' : growthDetail?.trend === 'down' ? 'Declining' : 'Stable';
            return (
              <Pressable
                key={src.label}
                style={[as.srcRow, i < ANALYTICS_GROWTH_SOURCES.length - 1 && { marginBottom: 12 }]}
                onPress={() => setExpandedGrowthSrc(growthExpanded ? null : src.label)}
              >
                <View style={as.srcLabelRow}>
                  <Text style={[as.srcLabel, { color: C.label }]}>{src.label}</Text>
                  <Text style={[as.srcCount, { color: C.secondary }]}>{src.count}  ·  {src.pct}%</Text>
                </View>
                <View style={[as.barTrackH, { backgroundColor: C.separator }]}>
                  <View style={[as.barFillH, { width: `${src.pct}%`, backgroundColor: C.label }]} />
                </View>
                {growthExpanded && growthDetail && (
                  <View style={{ paddingTop: 10, gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 8 }}>
                    <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: C.muted }}>Top posts:</Text>
                    {growthDetail.topPosts.map(post => (
                      <Text key={post} style={{ fontSize: 12, color: C.secondary }}>· {post}</Text>
                    ))}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <IconSymbol name={trendIcon as any} size={12} color={trendColor} />
                      <Text style={{ fontSize: 12, color: trendColor, fontWeight: '600' }}>{trendLabel}</Text>
                    </View>
                    <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: C.muted }}>Recent followers:</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{growthDetail.recentFollowers.join(', ')}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── Revenue Breakdown ── */}
        <SectionHeader title="Revenue by Source" C={C} />
        <View style={[as.card, { backgroundColor: C.surface }]}>
          {/* Stacked bar */}
          <View style={as.revStackedBar}>
            {ANALYTICS_REVENUE.map(r => (
              <View key={r.source} style={{ flex: r.pct, backgroundColor: C.label, opacity: 0.15 + (r.pct / 43) * 0.75 }} />
            ))}
          </View>
          <View style={[as.divider, { backgroundColor: C.separator, marginBottom: 12 }]} />
          {ANALYTICS_REVENUE.map((r, i) => {
            const isExpandable = r.source === 'Subscriptions' || r.source === 'Brand Deals' || r.source === 'Digital Products';
            const revExpanded = expandedRevSrc === r.source;
            const revDetail = ANALYTICS_REVENUE_DETAIL[r.source];
            if (isExpandable) {
              return (
                <Pressable
                  key={r.source}
                  style={[i < ANALYTICS_REVENUE.length - 1 && { marginBottom: 10 }]}
                  onPress={() => setExpandedRevSrc(revExpanded ? null : r.source)}
                >
                  <View style={as.revRow}>
                    <View style={[as.revDot, { backgroundColor: C.label, opacity: 0.2 + (r.pct / 43) * 0.8 }]} />
                    <Text style={[as.revSource, { color: C.label }]}>{r.source}</Text>
                    <Text style={[as.revPct,    { color: C.secondary }]}>{r.pct}%</Text>
                    <Text style={[as.revAmt,    { color: C.label }]}>${r.amount.toLocaleString()}</Text>
                    <IconSymbol name="chevron.right" size={14} color={C.muted} />
                  </View>
                  {revExpanded && revDetail && (
                    <View style={{ paddingTop: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 8 }}>
                      {revDetail.map(sub => (
                        <View key={sub.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{sub.label}</Text>
                          <Text style={{ fontSize: 12, color: C.secondary, marginRight: 8 }}>
                            {sub.count !== null ? `${sub.count} · ` : ''}{sub.detail}
                          </Text>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, width: 60, textAlign: 'right' }}>
                            ${sub.revenue.toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            }
            return (
              <View key={r.source} style={[as.revRow, i < ANALYTICS_REVENUE.length - 1 && { marginBottom: 10 }]}>
                <View style={[as.revDot, { backgroundColor: C.label, opacity: 0.2 + (r.pct / 43) * 0.8 }]} />
                <Text style={[as.revSource, { color: C.label }]}>{r.source}</Text>
                <Text style={[as.revPct,    { color: C.secondary }]}>{r.pct}%</Text>
                <Text style={[as.revAmt,    { color: C.label }]}>${r.amount.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Content Type Performance ── */}
        <SectionHeader title="What's Working" C={C} />
        <View style={as.ctGrid}>
          {ANALYTICS_CONTENT_TYPES.map((ct, i) => {
            const isBest = i === bestRevIdx;
            const ctExpanded = expandedContentType === ct.type;
            const ctPieces = ANALYTICS_TYPE_CONTENT[ct.type] ?? [];
            return (
              <Pressable
                key={ct.label}
                style={[
                  as.ctCard,
                  { backgroundColor: C.surface, borderColor: isBest ? GAIN : 'transparent', borderWidth: isBest ? 1.5 : 0 },
                  ctExpanded ? { width: '100%' } : {},
                ]}
                onPress={() => setExpandedContentType(ctExpanded ? null : ct.type)}
              >
                {isBest && (
                  <View style={[as.ctBestBadge, { backgroundColor: GAIN + '22' }]}>
                    <Text style={[as.ctBestText, { color: GAIN }]}>Best</Text>
                  </View>
                )}
                <View style={[as.ctIcon, { backgroundColor: C.bg }]}>
                  <IconSymbol name={contentTypeIcon(ct.type) as any} size={16} color={C.label} />
                </View>
                <Text style={[as.ctLabel, { color: C.label }]}>{ct.label}</Text>
                <View style={[as.divider, { backgroundColor: C.separator, marginVertical: 8 }]} />
                <Text style={[as.ctStat, { color: C.secondary }]}>{ct.count} published</Text>
                <Text style={[as.ctStat, { color: C.secondary }]}>{formatViews(ct.avgViews)} avg views</Text>
                <Text style={[as.ctStat, { color: C.secondary }]}>{ct.avgEng}% avg eng.</Text>
                <Text style={[as.ctStatBold, { color: C.label }]}>${ct.revenue} revenue</Text>
                {ctExpanded && ctPieces.length > 0 && (
                  <View style={{ marginTop: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 10 }}>
                    {ctPieces.map(piece => (
                      <View key={piece.title}>
                        <Text style={{ fontSize: 12, color: C.label }} numberOfLines={1}>{piece.title}</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                          <Text style={{ fontSize: 10, color: C.muted }}>{formatViews(piece.views)} views</Text>
                          <Text style={{ fontSize: 10, color: C.muted }}>{piece.engRate}%</Text>
                          {piece.revenue > 0 && <Text style={{ fontSize: 10, color: C.muted }}>${piece.revenue}</Text>}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // ── Non-personal mode placeholder content ────────────────────────────────────

  const renderNonPersonalTab = (tabName: string) => (
    <ScrollView
      key={`nonpersonal-${tabName}`}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 100 }}>
        <Text style={{ fontSize: 16, color: C.secondary, fontWeight: '600' }}>{tabName}</Text>
        <Text style={{ fontSize: 13, color: C.secondary, marginTop: 6, opacity: 0.6 }}>Coming soon</Text>
      </View>
    </ScrollView>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderContent = () => {
    // Non-personal modes get their own tab-based rendering
    if (mode === 'business') {
      if (bizTab === 'Overview')   return renderOwnerDashboard();
      return renderNonPersonalTab(bizTab);
    }
    if (mode === 'education') {
      if (eduTab === 'Overview')   return renderOwnerDashboard();
      return renderNonPersonalTab(eduTab);
    }
    if (mode === 'community') {
      if (comTab === 'Overview')   return renderOwnerDashboard();
      return renderNonPersonalTab(comTab);
    }
    if (mode === 'sports') {
      if (sportsTab === 'Overview') return renderOwnerDashboard();
      return renderNonPersonalTab(sportsTab);
    }
    // Personal mode — tabs for Owner, profile page for Follower
    if (isOwner) {
      if (activeTab === 'Content')   return renderOwnerContent();
      if (activeTab === 'Analytics') return renderOwnerAnalytics();
      return renderOwnerProfile();
    }
    return renderOwnerProfile(false);
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      {mode === 'personal' && activeTab === 'Profile' ? (
        <>{renderContent()}</>
      ) : (
        <>
          {renderContent()}
          {/* ── Fixed Top Bar (all modes except personal Profile) ── */}
          <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>

          {/* ── Business Mode ── */}
          {mode === 'business' && (<>
            <View style={s.topBarSide}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isBizAdmin) openSidePanel(); }}
                hitSlop={12}
              >
                <KMenuButton />
              </Pressable>
            </View>
            <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
                {(isBizAdmin
                  ? (['Overview', 'Projects', 'Documents'] as const)
                  : (['Overview', 'Projects'] as const)
                ).map(t => {
                  const active = bizTab === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => { Haptics.selectionAsync(); setBizTab(t as any); }}
                      style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{t}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
              <RolePill role={bizRole} onPress={bizCycleRole} isPrimary={isBizAdmin} />
            </View>
          </>)}

          {/* ── Education Mode ── */}
          {mode === 'education' && (<>
            <View style={s.topBarSide}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isEduAdmin) openSidePanel(); }}
                hitSlop={12}
              >
                <KMenuButton />
              </Pressable>
            </View>
            <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
                {(['Overview', 'Courses', 'Student Life'] as const).map(t => {
                  const active = eduTab === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => { Haptics.selectionAsync(); setEduTab(t as any); }}
                      style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{t}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
              <RolePill role={eduRole} onPress={eduCycleRole} isPrimary={isEduAdmin} />
            </View>
          </>)}

          {/* ── Community Mode ── */}
          {mode === 'community' && (<>
            <View style={s.topBarSide}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isComAdmin) openSidePanel(); }}
                hitSlop={12}
              >
                <KMenuButton />
              </Pressable>
            </View>
            <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
                {(isComAdmin
                  ? (['Overview', 'Services', 'Groups'] as const)
                  : (['Overview', 'Services'] as const)
                ).map(t => {
                  const active = comTab === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => { Haptics.selectionAsync(); setComTab(t as any); }}
                      style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{t}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
              <RolePill role={comRole} onPress={comCycleRole} isPrimary={isComAdmin} />
            </View>
          </>)}

          {/* ── Sports Mode ── */}
          {mode === 'sports' && (<>
            <View style={s.topBarSide}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isSportsAdmin) openSidePanel(); }}
                hitSlop={12}
              >
                <KMenuButton />
              </Pressable>
            </View>
            <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
                {(isSportsAdmin
                  ? (['Overview', 'Film Room', 'Scouting', 'Game Day'] as const)
                  : (['Overview', 'Film Room'] as const)
                ).map(t => {
                  const active = sportsTab === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => { Haptics.selectionAsync(); setSportsTab(t as any); }}
                      style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{t}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
              <RolePill role={sportsRole} onPress={sportsCycleRole} isPrimary={isSportsAdmin} />
            </View>
          </>)}

          {/* ── Personal Mode ── */}
          {mode === 'personal' && (<>
            {/* Left: K button */}
            <View style={s.topBarSide}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (isOwner) openSidePanel(); }}
                hitSlop={12}
              >
                <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: activeTab === 'Profile' ? '#fff' : C.label }}>K</Text>
              </Pressable>
            </View>

            {/* Center: handle on Profile, cream pill on Content/Analytics */}
            <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
              {activeTab === 'Profile' ? (
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>@sammyk</Text>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.separator, backgroundColor: C.surface, marginHorizontal: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{activeTab}</Text>
                </View>
              )}
            </View>

            {/* Right: RolePill */}
            <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
              <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
            </View>
          </>)}

        </View>
      </View>
        </>
      )}


      {/* ── Content Composer ── */}
      <BottomSheet visible={showComposer} onClose={() => setShowComposer(false)}>
        <View style={cs.composerWrap}>
          <Text style={[cs.composerTitle, { color: C.label }]}>New Content</Text>

          {/* Destination pills */}
          <Text style={[cs.composerLabel, { color: C.secondary }]}>Destination</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {['Social', 'Reels', 'KTV', 'Stories'].map(d => {
              const active = false;
              return (
                <Pressable key={d} style={[cs.composerPill, { borderColor: C.separator, backgroundColor: active ? C.label : 'transparent' }]}>
                  <Text style={[cs.composerPillText, { color: active ? C.bg : C.secondary }]}>{d}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Title */}
          <Text style={[cs.composerLabel, { color: C.secondary }]}>Title</Text>
          <TextInput
            placeholder="Add a title..."
            placeholderTextColor={C.muted}
            style={[cs.composerInput, { color: C.label, backgroundColor: C.surface, borderColor: C.separator }]}
          />

          {/* Caption */}
          <Text style={[cs.composerLabel, { color: C.secondary }]}>Caption</Text>
          <TextInput
            placeholder="Write your caption..."
            placeholderTextColor={C.muted}
            multiline
            numberOfLines={4}
            style={[cs.composerInput, cs.composerTextArea, { color: C.label, backgroundColor: C.surface, borderColor: C.separator }]}
          />

          {/* Visibility */}
          <Text style={[cs.composerLabel, { color: C.secondary }]}>Visibility</Text>
          <View style={cs.visibilityRow}>
            {['Public', 'Subscribers Only'].map((v, i) => (
              <Pressable key={v} style={[cs.visibilityBtn, { backgroundColor: i === 0 ? C.label : C.surface, borderColor: C.separator }]}>
                <Text style={[cs.visibilityText, { color: i === 0 ? C.bg : C.secondary }]}>{v}</Text>
              </Pressable>
            ))}
          </View>

          {/* Media + Dipson row */}
          <View style={cs.composerActionsRow}>
            <Pressable style={[cs.mediaBtn, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <IconSymbol name="photo" size={16} color={C.secondary} />
              <Text style={[cs.mediaBtnText, { color: C.secondary }]}>Media</Text>
            </Pressable>
            <Pressable style={[cs.dipsonBtn, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[cs.dipsonBtnText, { color: C.label }]}>✦ Dipson</Text>
            </Pressable>
          </View>

          {/* Schedule + Publish */}
          <View style={[cs.composerFooter, { borderTopColor: C.separator }]}>
            <Pressable style={[cs.scheduleBtn, { borderColor: C.separator }]}>
              <IconSymbol name="calendar" size={16} color={C.secondary} />
              <Text style={[cs.scheduleBtnText, { color: C.secondary }]}>Schedule</Text>
            </Pressable>
            <Pressable style={[cs.publishBtn, { backgroundColor: C.label }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowComposer(false); }}>
              <Text style={[cs.publishBtnText, { color: C.bg }]}>Publish Now</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

// ── Content Tab Styles ────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  card:            { borderRadius: 14, padding: 14, marginBottom: 20 },

  // Calendar
  calHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  toggleRow:       { flexDirection: 'row', gap: 4 },
  viewToggle:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  viewToggleText:  { fontSize: 12, fontWeight: '500' },
  navRow:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekLabel:       { fontSize: 12, fontWeight: '500' },
  weekRow:         { flexDirection: 'row', gap: 2 },
  dayCell:         { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  dayName:         { fontSize: 10, fontWeight: '500' },
  dayNumCircle:    { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayNumText:      { fontSize: 13, fontWeight: '600' },
  dotRow:          { flexDirection: 'row', gap: 3, height: 6, alignItems: 'center' },
  dot:             { width: 5, height: 5, borderRadius: 3 },

  // Selected day expanded
  dayExpanded:     { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  dayExpandedLabel:{ fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  dayItemRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  dayItemTitle:    { flex: 1, fontSize: 13, fontWeight: '500' },
  dayItemTime:     { fontSize: 11 },
  typeIconCircle:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statusPill:      { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  statusPillText:  { fontSize: 10, fontWeight: '600' },

  // Up Next
  upNextCard:      { borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  upNextTitle:     { fontSize: 14, fontWeight: '600' },
  upNextMeta:      { fontSize: 12 },

  // Drafts
  draftRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  draftTitle:      { fontSize: 14, fontWeight: '500' },
  draftMeta:       { fontSize: 12 },

  // Library
  searchBar:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 10 },
  searchInput:     { flex: 1, fontSize: 14, padding: 0 },
  libraryRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 6 },
  thumbPlaceholder:{ width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  libraryTitle:    { fontSize: 14, fontWeight: '500' },
  libraryMeta:     { fontSize: 11 },
  emptyText:       { fontSize: 13, textAlign: 'center', paddingVertical: 24 },

  // Composer
  composerWrap:    { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  composerTitle:   { fontSize: 18, fontWeight: '700', marginBottom: 18 },
  composerLabel:   { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  composerInput:   { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 14 },
  composerTextArea:{ minHeight: 100, textAlignVertical: 'top' },
  composerPill:    { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  composerPillText:{ fontSize: 13 },
  visibilityRow:   { flexDirection: 'row', gap: 8, marginBottom: 14 },
  visibilityBtn:   { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  visibilityText:  { fontSize: 13, fontWeight: '500' },
  composerActionsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  mediaBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  mediaBtnText:    { fontSize: 13 },
  dipsonBtn:       { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  dipsonBtnText:   { fontSize: 13, fontWeight: '600' },
  composerFooter:  { flexDirection: 'row', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 16, marginTop: 4 },
  scheduleBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingVertical: 12 },
  scheduleBtnText: { fontSize: 14, fontWeight: '500' },
  publishBtn:      { flex: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  publishBtnText:  { fontSize: 14, fontWeight: '600' },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },

  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 80, justifyContent: 'center' },

  centerPill: { flex: 1, marginHorizontal: 10, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  centerPillText: { fontSize: 14, fontWeight: '700' },

  pillsRow: { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13 },

  ownerToggle: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  ownerToggleText: { fontSize: 11, fontWeight: '700' },

  section: { borderRadius: 16, padding: 16, marginBottom: 20 },

  // Owner Dashboard
  metricBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  metricBtnText: { fontSize: 12, fontWeight: '600' },
  actionBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },

  // Visitor Dashboard
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

// ── Analytics Styles ──────────────────────────────────────────────────────────

const as = StyleSheet.create({
  card:           { borderRadius: 14, padding: 14, marginBottom: 20 },
  subHeader:      { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  divider:        { height: StyleSheet.hairlineWidth, marginVertical: 14 },

  // Engagement
  engHeaderRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  bigRate:        { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  trendRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  trendText:      { fontSize: 12, fontWeight: '600' },
  periodPills:    { flexDirection: 'row', gap: 4 },
  periodPill:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  periodPillText: { fontSize: 12, fontWeight: '500' },
  chartAxisRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel:      { fontSize: 10 },

  // Audience
  ageRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ageLabel:       { fontSize: 12, width: 44 },
  barTrackH:      { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFillH:       { height: '100%', borderRadius: 3 },
  agePct:         { fontSize: 12, fontWeight: '600', width: 32, textAlign: 'right' },
  genderText:     { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  locationRank:   { fontSize: 12, width: 16, textAlign: 'center' },
  locationCity:   { flex: 1, fontSize: 14, fontWeight: '500' },
  locationPct:    { fontSize: 13, fontWeight: '600' },

  // Heatmap
  hmHeaderRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hmHourLabel:    { flex: 1, fontSize: 8, textAlign: 'center' },
  hmRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  hmDayLabel:     { width: 32, fontSize: 10, fontWeight: '500' },
  hmCell:         { flex: 1, height: 28, borderRadius: 4, marginHorizontal: 1, overflow: 'visible' },
  hmCellFill:     { ...StyleSheet.absoluteFillObject, borderRadius: 4 },
  hmTooltip:      { position: 'absolute', top: -22, alignSelf: 'center', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, zIndex: 10 },
  hmTooltipText:  { fontSize: 9, fontWeight: '700' },
  hmFooter:       { fontSize: 10, textAlign: 'center', marginTop: 8 },

  // Top Content
  topMetricPills: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  metricPill:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  metricPillText: { fontSize: 12, fontWeight: '500' },
  topCard:        { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, marginBottom: 6 },
  topRankCircle:  { width: 20, alignItems: 'center' },
  topRank:        { fontSize: 13, fontWeight: '700' },
  topThumb:       { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topTitle:       { fontSize: 14, fontWeight: '600' },
  topMeta:        { fontSize: 11 },
  topValue:       { fontSize: 13, fontWeight: '700' },
  typeBadge:      { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  typeBadgeText:  { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Growth sources
  srcRow:         { },
  srcLabelRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  srcLabel:       { fontSize: 13, fontWeight: '500' },
  srcCount:       { fontSize: 12 },
  growthTip:      { position: 'absolute', bottom: 12, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, zIndex: 10 },
  growthTipText:  { fontSize: 11, fontWeight: '700' },

  // Revenue
  revStackedBar:  { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
  revRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revDot:         { width: 8, height: 8, borderRadius: 4 },
  revSource:      { flex: 1, fontSize: 13, fontWeight: '500' },
  revPct:         { fontSize: 12, width: 32, textAlign: 'right' },
  revAmt:         { fontSize: 13, fontWeight: '700', width: 72, textAlign: 'right' },

  // Content type grid
  ctGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  ctCard:         { width: '47%', borderRadius: 14, padding: 12 },
  ctBestBadge:    { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 8 },
  ctBestText:     { fontSize: 10, fontWeight: '700' },
  ctIcon:         { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  ctLabel:        { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  ctStat:         { fontSize: 12, marginBottom: 2 },
  ctStatBold:     { fontSize: 13, fontWeight: '700', marginTop: 4 },
});
