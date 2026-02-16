/**
 * Dashboard Renderer — Universal Block Layout
 * Accepts DashboardTruthPayload and renders blocks 0–6 in fixed order.
 * Use renderAsFragment when the parent already provides a ScrollView.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { VideoHeroCard } from '@/components/ui/video-hero-card';
import { ContextSnapshotRow } from '@/components/dashboard/context-snapshot-row';
import { TodayNextCards } from '@/components/dashboard/today-next-cards';
import { AlertsStrip } from '@/components/dashboard/alerts-strip';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { FeedPreview } from '@/components/dashboard/feed-preview';
import { PinnedShelf } from '@/components/dashboard/pinned-shelf';
import { Spacing } from '@/constants/theme';
import type { DashboardTruthPayload } from '@/types/dashboard';

interface DashboardRendererProps {
  payload: DashboardTruthPayload;
  skipHeroVideo?: boolean;
  renderAsFragment?: boolean;
}

export function DashboardRenderer({ payload, skipHeroVideo, renderAsFragment }: DashboardRendererProps) {
  const blocks = (
    <>
      {/* Block 0 — Hero Video */}
      {!skipHeroVideo && (
        <VideoHeroCard
          title={payload.heroVideo.title}
          subtitle={payload.heroVideo.subtitle}
          liveBadge={payload.heroVideo.liveBadge}
        />
      )}

      {/* Block 1 — Context Snapshot (3 KPI cards) */}
      <ContextSnapshotRow items={payload.contextSnapshot} />

      {/* Block 2 — Today / Next */}
      <TodayNextCards items={payload.todayNext} />

      {/* Block 3 — Alerts (hidden if empty) */}
      <AlertsStrip alerts={payload.alerts} />

      {/* Block 4 — Quick Actions */}
      <QuickActions actions={payload.quickActions} />

      {/* Block 5 — Feed Preview */}
      <FeedPreview feed={payload.feedPreview} />

      {/* Block 6 — Pinned Shelf (hidden if empty) */}
      <PinnedShelf items={payload.pinnedShelf} />
    </>
  );

  if (renderAsFragment) {
    return <View style={styles.fragmentGap}>{blocks}</View>;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {blocks}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fragmentGap: {
    gap: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: Spacing.md,
  },
});
