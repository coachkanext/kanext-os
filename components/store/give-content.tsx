/**
 * Give Content — 3-page swipeable layout for church/faith mode.
 * Page 0: Give — hero, designation cards, giving flow (stub).
 * Page 1: History — giving summary, transaction list.
 * Page 2: Campaigns — active/upcoming/completed giving campaigns.
 * 3 dots at top. Swipe right on page 0 = side panel.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getGivingHero,
  getGivingDesignations,
  getGivingHistory,
  getGivingSummary,
  getGivingCampaigns,
  formatPrice,
  formatCompactAmount,
  GIVE_CATEGORIES,
  HISTORY_FILTERS,
  CAMPAIGN_FILTERS,
  type GivingDesignation,
  type GivingTransaction,
  type GivingCampaign,
} from '@/data/mock-store';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ─── Shared ───────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Giving Hero ──────────────────────────────────────────────────────────

function GivingHero() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const hero = getGivingHero();
  const pct = Math.round((hero.raisedAmount / hero.goalAmount) * 100);

  return (
    <Pressable style={s.heroCard}>
      <Text style={s.heroTitle}>{hero.title}</Text>
      <Text style={s.heroSubtitle}>{hero.subtitle}</Text>
      <View style={s.progressBarBg}>
        <View style={[s.progressBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.heroAmount}>
        {formatCompactAmount(hero.raisedAmount)} of {formatCompactAmount(hero.goalAmount)} raised
      </Text>
    </Pressable>
  );
}

// ─── Designation Card ─────────────────────────────────────────────────────

function DesignationCard({ item }: { item: GivingDesignation }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.designationRow}>
      <View style={s.designationInfo}>
        <Text style={s.designationName}>{item.name}</Text>
        <Text style={s.designationDesc} numberOfLines={1}>{item.description}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [s.giveBtn, pressed && { opacity: 0.8 }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Text style={s.giveBtnText}>Give</Text>
      </Pressable>
    </View>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: GivingTransaction }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable style={({ pressed }) => [s.txRow, pressed && { opacity: 0.85 }]}>
      <View style={s.txIcon}>
        <IconSymbol name="heart.fill" size={16} color={C.purple} />
      </View>
      <View style={s.txInfo}>
        <Text style={s.txDesignation}>{tx.designation}</Text>
        <Text style={s.txMeta}>
          {tx.date} · {tx.paymentMethod}
          {tx.frequency !== 'one-time' && (
            <Text style={s.txRecurring}> · {tx.frequency}</Text>
          )}
        </Text>
      </View>
      <Text style={s.txAmount}>{formatPrice(tx.amount)}</Text>
    </Pressable>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: GivingCampaign }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const pct = campaign.goalAmount > 0
    ? Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)
    : 0;

  return (
    <Pressable style={({ pressed }) => [s.campaignCard, pressed && { opacity: 0.85 }]}>
      <Text style={s.campaignName}>{campaign.name}</Text>
      <Text style={s.campaignDesc} numberOfLines={2}>{campaign.description}</Text>

      <View style={s.progressBarBg}>
        <View style={[s.progressBarFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>
      <View style={s.campaignStats}>
        <Text style={s.campaignAmount}>
          {formatCompactAmount(campaign.raisedAmount)} of {formatCompactAmount(campaign.goalAmount)}
        </Text>
        <Text style={s.campaignPct}>{pct}%</Text>
      </View>

      <View style={s.campaignMeta}>
        <Text style={s.campaignMetaText}>
          {campaign.donorCount} donors
          {campaign.deadline ? ` · ${campaign.deadline}` : ''}
        </Text>
        {campaign.status !== 'completed' && (
          <Pressable
            style={({ pressed }) => [s.campaignGiveBtn, pressed && { opacity: 0.8 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={s.campaignGiveBtnText}>Give</Text>
          </Pressable>
        )}
        {campaign.status === 'completed' && (
          <View style={s.completedBadge}>
            <Text style={s.completedBadgeText}>Completed</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function GiveContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [giveCategory, setGiveCategory] = useState('all');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const designations = useMemo(() => getGivingDesignations(), []);
  const filteredDesignations = useMemo(() => {
    if (giveCategory === 'all') return designations;
    const map: Record<string, string> = { tithe: 'Tithe', offering: 'General Offering', missions: 'Missions Fund', building_fund: 'Building Fund' };
    const name = map[giveCategory];
    return name ? designations.filter((d) => d.name === name) : designations;
  }, [designations, giveCategory]);

  const summary = useMemo(() => getGivingSummary(), []);
  const history = useMemo(() => getGivingHistory(historyFilter), [historyFilter]);
  const campaigns = useMemo(() => getGivingCampaigns(campaignFilter), [campaignFilter]);

  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index);
    showFooter();
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={handlePageChange}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: GIVE ── */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <GivingHero />
            <FilterPills items={GIVE_CATEGORIES} active={giveCategory} onSelect={setGiveCategory} />
            {filteredDesignations.map((d, idx) => (
              <View key={d.id}>
                {idx > 0 && <View style={s.separator} />}
                <DesignationCard item={d} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 1: HISTORY ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="History" />
            {/* This year summary */}
            <View style={s.summaryCard}>
              <Text style={s.summaryTotal}>{formatPrice(summary.totalThisYear)}</Text>
              <Text style={s.summaryLabel}>Given this year</Text>
              <View style={s.summaryBreakdown}>
                {summary.breakdown.map((b) => (
                  <View key={b.designation} style={s.summaryItem}>
                    <Text style={s.summaryItemAmount}>{formatPrice(b.amount)}</Text>
                    <Text style={s.summaryItemLabel}>{b.designation}</Text>
                  </View>
                ))}
              </View>
            </View>
            <FilterPills items={HISTORY_FILTERS} active={historyFilter} onSelect={setHistoryFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {history.map((tx, idx) => (
              <View key={tx.id}>
                {idx > 0 && <View style={s.separator} />}
                <TransactionRow tx={tx} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 2: CAMPAIGNS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Campaigns" />
            <FilterPills items={CAMPAIGN_FILTERS} active={campaignFilter} onSelect={setCampaignFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
            {campaigns.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyText}>No campaigns found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SwipeablePages>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  topBarTitle: { fontSize: 22, fontWeight: '700', color: C.label },

  filterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  filterPillActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterText: { fontSize: 13, fontWeight: '600', color: C.secondary },
  filterTextActive: { color: '#000000' },

  // Hero
  heroCard: {
    marginHorizontal: 16, marginTop: 8, padding: 20,
    borderRadius: 16, backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: C.label },
  heroSubtitle: { fontSize: 13, color: C.secondary, marginTop: 2 },
  progressBarBg: {
    height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 16, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4, backgroundColor: C.green },
  heroAmount: { fontSize: 13, color: C.secondary, marginTop: 8 },

  // Designation
  designationRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  designationInfo: { flex: 1 },
  designationName: { fontSize: 16, fontWeight: '700', color: C.label },
  designationDesc: { fontSize: 12, color: C.muted, marginTop: 2 },
  giveBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8, backgroundColor: C.blue,
  },
  giveBtnText: { fontSize: 14, fontWeight: '700', color: C.label },

  // Summary
  summaryCard: {
    marginHorizontal: 16, marginBottom: 4, padding: 16,
    borderRadius: 12, backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
    alignItems: 'center',
  },
  summaryTotal: { fontSize: 32, fontWeight: '800', color: C.label },
  summaryLabel: { fontSize: 13, color: C.muted, marginTop: 2 },
  summaryBreakdown: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 16 },
  summaryItem: { alignItems: 'center' },
  summaryItemAmount: { fontSize: 15, fontWeight: '700', color: C.label },
  summaryItemLabel: { fontSize: 11, color: C.muted, marginTop: 1 },

  // Transactions
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  txIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.purple + '18', alignItems: 'center', justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txDesignation: { fontSize: 14, fontWeight: '600', color: C.label },
  txMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  txRecurring: { color: C.blue },
  txAmount: { fontSize: 15, fontWeight: '700', color: C.label },

  // Campaigns
  campaignCard: {
    backgroundColor: C.surface, borderRadius: 12, padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
  },
  campaignName: { fontSize: 16, fontWeight: '700', color: C.label },
  campaignDesc: { fontSize: 12, color: C.muted, marginTop: 4 },
  campaignStats: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  campaignAmount: { fontSize: 13, color: C.secondary },
  campaignPct: { fontSize: 13, fontWeight: '700', color: C.green },
  campaignMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10,
  },
  campaignMetaText: { fontSize: 11, color: C.muted },
  campaignGiveBtn: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 8, backgroundColor: C.blue,
  },
  campaignGiveBtnText: { fontSize: 12, fontWeight: '700', color: C.label },
  completedBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, backgroundColor: C.green + '18',
  },
  completedBadgeText: { fontSize: 11, fontWeight: '600', color: C.green },

  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginHorizontal: 16 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.muted },
});
