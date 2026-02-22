import type { ImageSourcePropType } from 'react-native';
import type { Mode } from '@/types';

/**
 * Per-org logo marks — static require() for Metro bundler compatibility.
 */
export const ORG_LOGOS: Record<Mode, ImageSourcePropType> = {
  sports:      require('@/assets/images/org-logos/carroll-college.png'),
  church:      require('@/assets/images/org-logos/2819-church.png'),
  education:   require('@/assets/images/org-logos/howard-university.png'),
  business:    require('@/assets/images/org-logos/valuetainment.png'),
  competition: require('@/assets/images/org-logos/adidas-3ssb.png'),
};
