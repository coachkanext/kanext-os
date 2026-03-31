/**
 * useColors — KaNeXT Design System palette hook.
 * Spec: KaNeXT_Design_System_Colors.md (canonical).
 *
 * Philosophy: Monochrome luxury. Color only for semantic meaning.
 * Core palette: Paper / Linen / Mist / Drift / Carbon / Ember
 * Semantic only: Gain / Heat / Caution
 * No blue. No accent color. No gradients.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  // ── Core palette ──────────────────────────────────────────────
  paper:   '#FFFFFF',          // primary background canvas
  linen:   '#F5F0EA',          // cards, tiles, elevated containers, input fields
  mist:    '#E0DBD4',          // borders, dividers, separators, inactive toggle tracks
  drift:   '#9C9790',          // secondary text, timestamps, placeholders, inactive icons
  carbon:  '#1A1714',          // primary text, active icons, buttons, tappable elements
  ember:   '#8B2500',          // ONLY: notification badges, live indicators, critical alerts

  // ── Semantic — data values only ───────────────────────────────
  gain:    '#5A8A6E',          // positive financial data, confirmed, success
  heat:    '#B85C5C',          // negative financial data, loss, error, destructive text
  caution: '#B8943E',          // warning, pending, approaching deadline

  // ── Named aliases (map to core palette) ───────────────────────
  bg:              '#FFFFFF',  // alias: paper
  surface:         '#F5F0EA',  // alias: linen
  surfacePressed:  'rgba(26,23,20,0.05)',
  cardBorder:      '#E0DBD4',  // alias: mist
  label:           '#1A1714',  // alias: carbon
  secondary:       '#9C9790',  // alias: drift
  muted:           '#9C9790',  // alias: drift
  separator:       '#E0DBD4',  // alias: mist
  divider:         '#E0DBD4',  // alias: mist
  inputBorder:     '#E0DBD4',  // alias: mist — focus border also becomes carbon via inline style

  // Interactive — Carbon ONLY. No blue. No accent color.
  accent:          '#1A1714',  // was blue; now carbon. every button/link/icon.
  accentLight:     '#1A1714',  // was light blue; now carbon.

  // Active chrome
  activePill:      '#1A1714',  // active tab/filter pill bg: Carbon
  activePillText:  '#FFFFFF',  // active tab/filter pill text: Paper

  // Semantic aliases (kept for backward compat with existing code)
  green:   '#5A8A6E',          // alias: gain
  red:     '#B85C5C',          // alias: heat
  gold:    '#B8943E',          // alias: caution
  amber:   '#B8943E',          // alias: caution

  // Legacy color aliases — all collapse to carbon (no colored icons)
  blue:    '#1A1714',
  purple:  '#1A1714',
  cyan:    '#1A1714',
  orange:  '#B8943E',          // → caution
  pink:    '#B85C5C',          // → heat
  teal:    '#5A8A6E',          // → gain

  // UI chrome
  dotActive:    '#1A1714',     // carbon
  dotInactive:  'rgba(26,23,20,0.20)',
  footer:       '#FFFFFF',     // paper
  footerDivider:'#E0DBD4',     // mist

  // Chat bubbles (Nexus)
  // User (sent): Carbon bg, Paper text
  // Nexus (received): Linen bg, Carbon text
  bubbleSent:     '#1A1714',   // user message bg: carbon
  bubbleReceived: '#F5F0EA',   // nexus message bg: linen
} as const;

export const DARK_PALETTE = {
  // ── Core palette ──────────────────────────────────────────────
  paper:   '#1C1410',          // primary background
  linen:   '#261D17',          // cards, tiles, elevated containers
  mist:    '#3D352E',          // borders, dividers, separators
  drift:   '#8A837C',          // secondary text, inactive icons
  carbon:  '#F0E8DC',          // primary text, active icons, buttons
  ember:   '#E08B6A',          // ONLY: badges, live indicators

  // ── Semantic ──────────────────────────────────────────────────
  gain:    '#6B9E80',
  heat:    '#D47A7A',
  caution: '#D4AE5A',

  // ── Named aliases ─────────────────────────────────────────────
  bg:              '#1C1410',
  surface:         '#261D17',
  surfacePressed:  'rgba(240,232,220,0.06)',
  cardBorder:      '#3D352E',
  label:           '#F0E8DC',
  secondary:       '#8A837C',
  muted:           '#8A837C',
  separator:       '#3D352E',
  divider:         '#3D352E',
  inputBorder:     '#3D352E',

  // Interactive — Carbon ONLY
  accent:          '#F0E8DC',
  accentLight:     '#F0E8DC',

  // Active chrome
  activePill:      '#F0E8DC',
  activePillText:  '#1C1410',

  // Semantic aliases
  green:   '#6B9E80',
  red:     '#D47A7A',
  gold:    '#D4AE5A',
  amber:   '#D4AE5A',

  // Legacy aliases
  blue:    '#F0E8DC',
  purple:  '#F0E8DC',
  cyan:    '#F0E8DC',
  orange:  '#D4AE5A',
  pink:    '#D47A7A',
  teal:    '#6B9E80',

  // UI chrome
  dotActive:    '#F0E8DC',
  dotInactive:  'rgba(240,232,220,0.20)',
  footer:       '#1C1410',
  footerDivider:'#3D352E',

  // Chat bubbles
  bubbleSent:     '#F0E8DC',
  bubbleReceived: '#261D17',
} as const;

export type ComponentColors = typeof LIGHT_PALETTE;

const palettes = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export function useColors(): ComponentColors {
  const scheme = useColorScheme();
  return palettes[scheme];
}
