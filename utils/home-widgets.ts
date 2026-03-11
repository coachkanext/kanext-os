import type { HeroVideo } from '@/components/home/home-types';
import type { Mode } from '@/types';

/**
 * Returns the single hero video for the home screen based on mode.
 *
 * Priority logic (production):
 *  1. LIVE event in your org → always wins
 *  2. Upcoming event within 2 hours → countdown
 *  3. Recently completed event → recap
 *  4. Org-pinned featured content
 *  5. Mode-relevant trending content
 *  6. Platform-curated default for that mode
 *
 * Current: returns demo default per mode (step 6).
 * Videos: Mixkit stock clips (free, Mixkit License).
 */

const MODE_DEFAULTS: Record<Mode, HeroVideo> = {
  sports: {
    id: 'sports-default',
    state: 'default',
    source: 'https://assets.mixkit.co/videos/44468/44468-720.mp4',
    route: '/(tabs)/(main)/kaytv',
    headline: 'Game Highlights',
    subline: 'Watch on KayTV',
  },
  business: {
    id: 'biz-default',
    state: 'default',
    source: 'https://assets.mixkit.co/videos/46680/46680-720.mp4',
    route: '/(tabs)/(main)/kaytv',
    headline: 'Company Spotlight',
    subline: 'Watch on KayTV',
  },
  church: {
    id: 'church-default',
    state: 'default',
    source: 'https://assets.mixkit.co/videos/46785/46785-720.mp4',
    route: '/(tabs)/(main)/kaytv',
    headline: 'Sunday Service',
    subline: 'Watch on KayTV',
  },
  education: {
    id: 'edu-default',
    state: 'default',
    source: 'https://assets.mixkit.co/videos/4519/4519-720.mp4',
    route: '/(tabs)/(main)/kaytv',
    headline: 'Campus Life',
    subline: 'Watch on KayTV',
  },
};

/**
 * Returns the single hero video for the current mode.
 * Production: will query org context for live/upcoming/recap/pinned content.
 */
export function getHeroVideo(mode: Mode = 'sports'): HeroVideo {
  return MODE_DEFAULTS[mode] ?? MODE_DEFAULTS.sports;
}
