/**
 * Biz Deals Pipeline V2 — Horizontal Kanban Board
 *
 * 5 Canonical Stages: Prospecting → In Discussion → Term Sheet → Diligence → Pending Close
 * Serious Kanban layout. No startup feel.
 * No custom stage editing in v1.
 *
 * Tap card → Deal Detail Sheet
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, MODE_ACCENT, BorderRadius } from '@/constants/theme';
import {
  DEAL_STAGES,
  DEAL_TYPE_COLORS,
  STAGE_COLORS,
  getPipelineDealsByStage,
  formatDealValue,
  type Deal,
  type DealStage,
} from '@/data/mock-deals';
import { BizDealDetailSheet } from '@/components/biz-home/biz-deal-detail-sheet';

const ACCENT = MODE_ACCENT.business;
const COLUMN_WIDTH = Dimensions.get('window').width * 0.72;

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizDealsPipelineV2({ colors, accent }: Props) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const handleOpenDeal = useCallback((deal: Deal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDeal(deal);
  }, []);

  return (
    <View style={s.container}>
      {/* ── Horizontal Kanban ──────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.kanbanScroll}
        decelerationRate="fast"
        snapToInterval={COLUMN_WIDTH + 12}
      >
        {DEAL_STAGES.map((stage) => {
          const deals = getPipelineDealsByStage(stage);
          const stageColor = STAGE_COLORS[stage];
          return (
            <View key={stage} style={[s.column, { width: COLUMN_WIDTH }]}>
              {/* Column header */}
              <View style={s.columnHeader}>
                <View style={[s.stageIndicator, { backgroundColor: stageColor }]} />
                <ThemedText style={[s.columnTitle, { color: colors.text }]}>{stage}</ThemedText>
                <View style={[s.countBadge, { backgroundColor: stageColor + '20' }]}>
                  <ThemedText style={[s.countText, { color: stageColor }]}>{deals.length}</ThemedText>
                </View>
              </View>

              {/* Deal cards */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.columnContent}
              >
                {deals.length === 0 ? (
                  <View style={[s.emptyColumn, { borderColor: colors.border }]}>
                    <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No deals</ThemedText>
                  </View>
                ) : (
                  deals.map((deal) => {
                    const typeColor = DEAL_TYPE_COLORS[deal.type];
                    return (
                      <Pressable
                        key={deal.id}
                        style={[s.dealCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleOpenDeal(deal)}
                      >
                        <ThemedText style={[s.dealName, { color: colors.text }]} numberOfLines={1}>
                          {deal.name}
                        </ThemedText>

                        <View style={s.dealMeta}>
                          <View style={[s.typePill, { backgroundColor: typeColor + '15' }]}>
                            <ThemedText style={[s.typePillText, { color: typeColor }]}>{deal.type}</ThemedText>
                          </View>
                        </View>

                        <ThemedText style={[s.counterparty, { color: colors.textSecondary }]} numberOfLines={1}>
                          {deal.counterparty}
                        </ThemedText>

                        <View style={s.dealFooter}>
                          {deal.targetValue > 0 && (
                            <ThemedText style={[s.dealValue, { color: colors.text }]}>
                              {formatDealValue(deal.targetValue)}
                            </ThemedText>
                          )}
                          <ThemedText style={[s.dealDate, { color: colors.textTertiary }]}>
                            {deal.expectedCloseDate}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })
                )}
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Deal Detail Sheet ──────────────────────────────────────── */}
      <BizDealDetailSheet
        deal={selectedDeal}
        visible={selectedDeal !== null}
        onClose={() => setSelectedDeal(null)}
        colors={colors}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },

  // Kanban
  kanbanScroll: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },

  // Column
  column: { flex: 1 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 2 },
  stageIndicator: { width: 4, height: 16, borderRadius: 2 },
  columnTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '800' },
  columnContent: { gap: 8 },

  // Empty column
  emptyColumn: { padding: 20, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  emptyText: { fontSize: 12 },

  // Deal card
  dealCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  dealName: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  dealMeta: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  typePillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  counterparty: { fontSize: 12, marginBottom: 8 },
  dealFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dealValue: { fontSize: 15, fontWeight: '800' },
  dealDate: { fontSize: 11 },
});
