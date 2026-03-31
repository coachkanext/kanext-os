/**
 * Biz Deals List Views — Active, Closed, and Archive
 *
 * Active: Signed but not fully settled. Shows remaining value + key milestone date.
 * Closed: Fully executed. Read-only except amendment proposals. Shows final value + close date.
 * Archive: Abandoned or declined. Read-only. No deletion.
 *
 * All share the same card layout, just with different data emphasis.
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, MODE_ACCENT, BorderRadius } from '@/constants/theme';
import {
  DEAL_TYPE_COLORS,
  getDealsByLifecycle,
  formatDealValue,
  type Deal,
  type DealLifecycle,
} from '@/data/mock-deals';
import { BizDealDetailSheet } from '@/components/biz-home/biz-deal-detail-sheet';

const ACCENT = MODE_ACCENT.business;

const STATUS_COLORS: Record<string, string> = {
  Active: '#5A8A6E',
  'Pending Close': '#B8943E',
  Closed: '#9C9790',
  Cancelled: '#B85C5C',
};

// =============================================================================
// SHARED CARD COMPONENT
// =============================================================================

interface CardProps {
  deal: Deal;
  colors: typeof Colors.light;
  onPress: (deal: Deal) => void;
  variant: DealLifecycle;
}

function DealCard({ deal, colors, onPress, variant }: CardProps) {
  const typeColor = DEAL_TYPE_COLORS[deal.type];
  const statusColor = STATUS_COLORS[deal.status] ?? '#9C9790';

  return (
    <Pressable
      style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(deal)}
    >
      <View style={s.cardTop}>
        <View style={s.cardInfo}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {deal.name}
          </ThemedText>
          <View style={s.cardPills}>
            <View style={[s.typePill, { backgroundColor: typeColor + '15' }]}>
              <ThemedText style={[s.typePillText, { color: typeColor }]}>{deal.type}</ThemedText>
            </View>
            <View style={[s.statusPill, { backgroundColor: statusColor + '15' }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[s.statusPillText, { color: statusColor }]}>{deal.status}</ThemedText>
            </View>
          </View>
        </View>
      </View>

      <ThemedText style={[s.counterparty, { color: colors.textSecondary }]}>
        {deal.counterparty}
      </ThemedText>

      <View style={s.cardFooter}>
        {variant === 'active' && (
          <>
            <View style={s.footerItem}>
              <ThemedText style={[s.footerLabel, { color: colors.textTertiary }]}>Total</ThemedText>
              <ThemedText style={[s.footerValue, { color: colors.text }]}>
                {formatDealValue(deal.targetValue)}
              </ThemedText>
            </View>
            {deal.remainingValue != null && (
              <View style={s.footerItem}>
                <ThemedText style={[s.footerLabel, { color: colors.textTertiary }]}>Remaining</ThemedText>
                <ThemedText style={[s.footerValue, { color: '#B8943E' }]}>
                  {formatDealValue(deal.remainingValue)}
                </ThemedText>
              </View>
            )}
            {deal.keyMilestoneDate && (
              <View style={s.footerItem}>
                <ThemedText style={[s.footerLabel, { color: colors.textTertiary }]}>Key Date</ThemedText>
                <ThemedText style={[s.footerValue, { color: colors.textSecondary }]}>
                  {deal.keyMilestoneDate}
                </ThemedText>
              </View>
            )}
          </>
        )}

        {variant === 'closed' && (
          <>
            <View style={s.footerItem}>
              <ThemedText style={[s.footerLabel, { color: colors.textTertiary }]}>Final Value</ThemedText>
              <ThemedText style={[s.footerValue, { color: colors.text }]}>
                {formatDealValue(deal.finalValue ?? deal.targetValue)}
              </ThemedText>
            </View>
            {deal.closeDate && (
              <View style={s.footerItem}>
                <ThemedText style={[s.footerLabel, { color: colors.textTertiary }]}>Close Date</ThemedText>
                <ThemedText style={[s.footerValue, { color: colors.textSecondary }]}>
                  {deal.closeDate}
                </ThemedText>
              </View>
            )}
          </>
        )}

        {variant === 'archive' && (
          <>
            <View style={s.footerItem}>
              <ThemedText style={[s.footerLabel, { color: colors.textTertiary }]}>Target</ThemedText>
              <ThemedText style={[s.footerValue, { color: colors.textTertiary }]}>
                {formatDealValue(deal.targetValue)}
              </ThemedText>
            </View>
            <View style={s.footerItem}>
              <ThemedText style={[s.footerLabel, { color: colors.textTertiary }]}>Expected</ThemedText>
              <ThemedText style={[s.footerValue, { color: colors.textTertiary }]}>
                {deal.expectedCloseDate}
              </ThemedText>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// ACTIVE VIEW
// =============================================================================

interface ViewProps {
  colors: typeof Colors.light;
  accent: string;
}

export function BizDealsActiveView({ colors }: ViewProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const deals = getDealsByLifecycle('active');

  const handleOpen = useCallback((deal: Deal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDeal(deal);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {deals.length === 0 ? (
          <View style={s.emptyState}>
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No active deals.</ThemedText>
          </View>
        ) : (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} colors={colors} onPress={handleOpen} variant="active" />
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
      <BizDealDetailSheet deal={selectedDeal} visible={selectedDeal !== null} onClose={() => setSelectedDeal(null)} colors={colors} />
    </View>
  );
}

// =============================================================================
// CLOSED VIEW
// =============================================================================

export function BizDealsClosedView({ colors }: ViewProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const deals = getDealsByLifecycle('closed');

  const handleOpen = useCallback((deal: Deal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDeal(deal);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {deals.length === 0 ? (
          <View style={s.emptyState}>
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No closed deals.</ThemedText>
          </View>
        ) : (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} colors={colors} onPress={handleOpen} variant="closed" />
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
      <BizDealDetailSheet deal={selectedDeal} visible={selectedDeal !== null} onClose={() => setSelectedDeal(null)} colors={colors} />
    </View>
  );
}

// =============================================================================
// ARCHIVE VIEW
// =============================================================================

export function BizDealsArchiveView({ colors }: ViewProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const deals = getDealsByLifecycle('archive');

  const handleOpen = useCallback((deal: Deal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDeal(deal);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {deals.length === 0 ? (
          <View style={s.emptyState}>
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No archived deals.</ThemedText>
          </View>
        ) : (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} colors={colors} onPress={handleOpen} variant="archive" />
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
      <BizDealDetailSheet deal={selectedDeal} visible={selectedDeal !== null} onClose={() => setSelectedDeal(null)} colors={colors} />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 4 },

  // Card
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  cardPills: { flexDirection: 'row', gap: 6 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  typePillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusPillText: { fontSize: 9, fontWeight: '700' },
  counterparty: { fontSize: 12, marginBottom: 10 },

  // Footer
  cardFooter: { flexDirection: 'row', gap: 16 },
  footerItem: {},
  footerLabel: { fontSize: 10, marginBottom: 2 },
  footerValue: { fontSize: 13, fontWeight: '700' },

  // Empty
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
