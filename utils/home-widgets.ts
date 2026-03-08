import type { VideoPage } from '@/components/home/home-types';

/**
 * Mock video pages. Priority: LIVE > RECAP > HYPE.
 * Always show highest priority available. Max 2 pages.
 *
 * Phase 1: uses public sample video URIs as placeholders.
 * Production: these will come from the program's media pipeline.
 */
const MOCK_PAGES: VideoPage[] = [
  {
    id: 'primary',
    state: 'recap',
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'LU 78 \u2014 HU 72',
    subtitle: 'Final \u00B7 W',
    meta: 'Feb 28 vs. Howard',
    route: '/section?title=Media',
    poster: require('@/assets/images/team-logo.png'),
  },
  {
    id: 'secondary',
    state: 'hype',
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Player Spotlight',
    subtitle: 'Sammy Kalejaiye',
    route: '/section?title=Media',
    poster: require('@/assets/images/sammy-kalejaiye.jpg'),
  },
  {
    id: 'tertiary',
    state: 'hype',
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'Game Day Hype',
    subtitle: 'Lincoln University',
    route: '/section?title=Media',
    poster: require('@/assets/images/team-logo.png'),
  },
];

/** State priority — lower number = higher priority */
const STATE_PRIORITY: Record<string, number> = {
  live: 0,
  recap: 1,
  hype: 2,
};

/**
 * Returns up to 2 video pages sorted by state priority (LIVE > RECAP > HYPE).
 */
export function getVideoPages(): VideoPage[] {
  return [...MOCK_PAGES]
    .sort((a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state])
    .slice(0, 2);
}
