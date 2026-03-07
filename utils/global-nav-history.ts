/**
 * Global Navigation Forward History
 * Tracks pages navigated away from via back(), enabling forward navigation.
 *
 * No-duplicates rule: history is always a clean list of unique screens.
 * If a route already exists in the stack, the old instance is removed.
 */

let forwardStack: string[] = [];

/** Push a route onto the forward stack (call before router.back()).
 *  Removes any existing instance of the same route to prevent duplicates. */
export function pushForward(route: string) {
  forwardStack = forwardStack.filter((r) => r !== route);
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
