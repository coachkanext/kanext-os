import type { IconSymbolName } from '@/components/ui/icon-symbol';

/** Video content priority — LIVE > UPCOMING > RECAP > FEATURED > DEFAULT */
export type VideoState = 'live' | 'upcoming' | 'recap' | 'featured' | 'default';

export interface HeroVideo {
  id: string;
  state: VideoState;
  /** Remote or local video URI */
  source: string;
  /** Tap destination (e.g. KayTV deep link) */
  route?: string;
  /** Fallback image while video loads */
  poster?: any;
  /** Badge text (e.g. "LIVE", "2h", "RECAP") */
  badge?: string;
  /** Headline overlay (e.g. score, title) */
  headline?: string;
  /** Subline overlay (e.g. opponent, pastor name) */
  subline?: string;
}

export interface GridIcon {
  id: string;
  icon: IconSymbolName;
  label: string;
  route: string;
  badgeCount?: number;
  /** Optional image source — when set, renders Image instead of SF Symbol glyph */
  image?: any;
}
