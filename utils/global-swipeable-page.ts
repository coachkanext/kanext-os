/**
 * Global registry for swipeable 2-page state.
 * Lets root _layout.tsx know when a SwipeableTwoPage is mounted
 * and which page index it's on, so the root panelOpenPanResponder
 * can decide whether to capture right-swipe gestures.
 */

let _active = false;
let _pageIndex = 0;

export function setSwipeablePageActive(active: boolean) {
  _active = active;
}

export function setSwipeablePageIndex(index: number) {
  _pageIndex = index;
}

export function isSwipeablePageActive(): boolean {
  return _active;
}

export function getSwipeablePageIndex(): number {
  return _pageIndex;
}
