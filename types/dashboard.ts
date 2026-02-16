/**
 * Dashboard Truth Payload — Universal Block System
 * Every mode's dashboard renders blocks 0–6 via DashboardRenderer.
 * Payload builders produce plain data; renderer handles layout.
 */

import type { ImageSourcePropType } from 'react-native';

// Block 0 — Hero Video
export interface DashboardHeroVideo {
  title: string;
  subtitle: string;
  videoUri?: string;
  posterSource?: ImageSourcePropType;
  liveBadge?: string;
}

// Block 1 — Context Snapshot (3 KPI cards)
export interface DashboardKPI {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: 'up' | 'down' | 'flat';
  badgeColor?: string;
}

// Block 2 — Today / Next
export interface DashboardTodayNextItem {
  id: string;
  type: 'today' | 'next';
  title: string;
  subtitle: string;
  metadata?: string;
  routeTarget?: string;
}

// Block 3 — Alerts
export interface DashboardAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message?: string;
  routeTarget?: string;
}

// Block 4 — Quick Actions
export interface DashboardQuickAction {
  id: string;
  label: string;
  icon: string;
  routeTarget?: string;
}

// Block 5 — Feed Preview
export interface DashboardFeedItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp?: string;
  metadata?: string;
  icon?: string;
  routeTarget?: string;
}

export interface DashboardFeedPreview {
  title: string;
  items: DashboardFeedItem[];
  viewAllLabel?: string;
  viewAllRoute?: string;
}

// Block 6 — Pinned Shelf
export interface DashboardPinnedItem {
  id: string;
  type: 'eval_snapshot' | 'sim_result' | 'scout_packet' | 'doc_link' | 'video_clip';
  title: string;
  subtitle?: string;
  routeTarget?: string;
}

// Full Payload
export interface DashboardTruthPayload {
  heroVideo: DashboardHeroVideo;
  contextSnapshot: [DashboardKPI, DashboardKPI, DashboardKPI];
  todayNext: DashboardTodayNextItem[];
  alerts?: DashboardAlert[];
  quickActions: DashboardQuickAction[];
  feedPreview: DashboardFeedPreview;
  pinnedShelf?: DashboardPinnedItem[];
}
