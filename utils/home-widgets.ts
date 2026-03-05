import type { VideoPage } from '@/components/home/home-types';

/**
 * Mock video pages. Priority: LIVE > RECAP > HYPE.
 * Always show highest priority available. Max 4 pages.
 *
 * Phase 1: uses public sample video URIs as placeholders.
 * Production: these will come from the program's media pipeline.
 */
const MOCK_PAGES: VideoPage[] = [
  {
    id: 'hype-main',
    state: 'hype',
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Lincoln Basketball',
    subtitle: '2025-26 Season',
    route: '/section?title=Media',
    poster: require('@/assets/images/sammy-kalejaiye.jpg'),
  },
  {
    id: 'recap-last',
    state: 'recap',
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'LU 78 — HU 72',
    subtitle: 'Final \u00B7 W',
    meta: 'Feb 28 vs. Howard',
    route: '/section?title=Media',
    poster: require('@/assets/images/team-logo.png'),
  },
  {
    id: 'hype-players',
    state: 'hype',
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'Player Spotlight',
    subtitle: 'Sammy Kalejaiye',
    route: '/section?title=Media',
    poster: require('@/assets/images/sammy-kalejaiye.jpg'),
  },
  {
    id: 'hype-program',
    state: 'hype',
    source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    title: 'Program Highlights',
    subtitle: '2025-26 Best Plays',
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
 * Returns up to 4 video pages sorted by state priority (LIVE > RECAP > HYPE).
 */
export function getVideoPages(): VideoPage[] {
  return [...MOCK_PAGES]
    .sort((a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state])
    .slice(0, 4);
}
