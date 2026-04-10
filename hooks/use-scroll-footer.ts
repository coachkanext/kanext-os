/**
 * useScrollFooter — attach to any ScrollView to auto-hide the footer on
 * scroll-down and re-show it on scroll-up. Standard iOS scroll behavior.
 *
 * Usage:
 *   const scrollFooter = useScrollFooter();
 *   <ScrollView {...scrollFooter} ...>
 */

import { useRef, useCallback } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const THRESHOLD = 8; // px of scroll before triggering hide/show

export function useScrollFooter() {
  const lastY = useRef(0);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;

    if (y <= 0) {
      // At the very top — always show footer
      showFooter();
    } else if (y > lastY.current + THRESHOLD) {
      // Scrolling down — hide footer
      hideFooter();
    } else if (y < lastY.current - THRESHOLD) {
      // Scrolling up — show footer
      showFooter();
    }

    lastY.current = y;
  }, []);

  return { onScroll, scrollEventThrottle: 16 } as const;
}
