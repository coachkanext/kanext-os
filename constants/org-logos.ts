import type { ImageSourcePropType } from 'react-native';
import type { Mode } from '@/types';

/**
 * Per-org logo marks — static require() for Metro bundler compatibility.
 */
export const ORG_LOGOS: Record<Mode, ImageSourcePropType> = {
  sports:      require('@/assets/images/org-logos/lincoln-university.png'),
  church:      require('@/assets/images/org-logos/icc.png'),
  education:   require('@/assets/images/org-logos/howard-university.png'),
  business:    require('@/assets/images/org-logos/kanext.png'),
  competition: require('@/assets/images/org-logos/adidas-3ssb.png'),
};
