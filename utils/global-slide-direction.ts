/**
 * Global navigation animation control.
 * Default: instant (no animation) for all footer/grid taps.
 * Slide animation only for swipe-to-Nexus and side panels.
 *
 * The inner (main) Stack and root Stack (Nexus) read
 * these values in their screenOptions functions.
 */

type NavAnim = 'slide_from_right' | 'slide_from_left' | 'none';

let _innerAnim: NavAnim = 'none';
let _rootNexusAnim: NavAnim = 'slide_from_right';

/** Instant transition (footer taps, grid taps) */
export function setInstantNav(): void {
  _innerAnim = 'none';
  _rootNexusAnim = 'none';
}

/** Slide transition (swipe-to-Nexus) */
export function setSlideNav(): void {
  _innerAnim = 'slide_from_right';
  _rootNexusAnim = 'slide_from_right';
}

export function getInnerAnimation(): NavAnim { return _innerAnim; }
export function getRootNexusAnimation(): NavAnim { return _rootNexusAnim; }

/** Reset to defaults: inner = none, root = slide */
export function resetNavAnimation(): void {
  _innerAnim = 'none';
  _rootNexusAnim = 'slide_from_right';
}
