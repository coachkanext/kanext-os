/**
 * Global Video Pager Controller
 * Allows horizontal swipes anywhere on the home screen to page through videos.
 */

let _nextPage: (() => void) | null = null;
let _prevPage: (() => void) | null = null;

export function registerVideoPagerHandlers(next: () => void, prev: () => void) {
  _nextPage = next;
  _prevPage = prev;
}

export function nextVideoPage() {
  _nextPage?.();
}

export function prevVideoPage() {
  _prevPage?.();
}
