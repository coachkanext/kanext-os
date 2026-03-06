/**
 * Global Video Pager Controller
 * Allows horizontal swipes anywhere on the home screen to page through videos.
 */

let _nextPage: (() => void) | null = null;
let _prevPage: (() => void) | null = null;
let _currentPage = 0;
let _maxPage = 0;

export function registerVideoPagerHandlers(next: () => void, prev: () => void, maxIndex?: number) {
  _nextPage = next;
  _prevPage = prev;
  if (maxIndex !== undefined) _maxPage = maxIndex;
}

export function setVideoPage(index: number) {
  _currentPage = index;
}

export function getVideoPage(): number {
  return _currentPage;
}

export function nextVideoPage() {
  _nextPage?.();
}

export function prevVideoPage() {
  _prevPage?.();
}

export function getMaxVideoPage(): number {
  return _maxPage;
}
