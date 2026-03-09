import type { IconSymbolName } from '@/components/ui/icon-symbol';

/** Video content state — priority: LIVE > RECAP > HYPE */
export type VideoState = 'live' | 'recap' | 'hype';

export interface VideoPage {
  id: string;
  state: VideoState;
  /** Remote or local video URI */
  source: string;
  /** Tap destination */
  route?: string;
  /** Fallback image while video loads */
  poster?: any;
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
