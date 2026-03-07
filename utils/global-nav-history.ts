/**
 * Global Navigation Forward History
 * Tracks pages navigated away from via back(), enabling forward navigation.
 */

let forwardStack: string[] = [];

/** Push a route onto the forward stack (call before router.back()) */
export function pushForward(route: string) {
  forwardStack.push(route);
}

/** Pop and return the most recent forward route, or null */
export function popForward(): string | null {
  return forwardStack.pop() ?? null;
}

/** Clear forward stack (e.g. on fresh navigation) */
export function clearForward() {
  forwardStack = [];
}

/** Check if forward navigation is available */
export function canGoForward(): boolean {
  return forwardStack.length > 0;
}
