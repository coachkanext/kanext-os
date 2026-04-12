/**
 * useColors — KaNeXT Design System palette hook.
 *
 * Visual language: Warm Linen — paper white, linen surfaces, carbon type.
 * Light: crisp white bg, warm linen cards, carbon near-black text.
 * Dark:  warm near-black, dark linen surfaces, cream text.
 *
 * Core:    Paper / Linen / Mist / Drift / Carbon / Ember
 * Semantic (data values only): Gain / Heat / Caution
 * No blue accent. Monochrome chrome.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  // ── Core palette ──────────────────────────────────────────────────────────
  paper:   '#FFFFFF',          // primary bg — crisp white
  linen:   '#F5F0EA',          // cards, tiles, elevated surfaces — warm linen
  mist:    '#E0DBD4',          // borders, dividers, separators — warm beige
  drift:   '#9C9790',          // secondary text, timestamps, placeholders
  carbon:  '#1A1714',          // primary text, icons, buttons — warm near-black
  ember:   '#8B2500',          // ONLY: notification badges, live indicators

  // ── Semantic — data values only ───────────────────────────────────────────
  gain:    '#5A8A6E',          // positive data, confirmed, success
  heat:    '#B85C5C',          // negative data, error, destructive
  caution: '#B8943E',          // warning, pending — warm amber

  // ── Named aliases ─────────────────────────────────────────────────────────
  bg:              '#FFFFFF',  // alias: paper
  surface:         '#F5F0EA',  // warm linen cards — alias: linen
  surfacePressed:  'rgba(26,23,20,0.05)',
  cardBorder:      '#E0DBD4',  // warm separator — alias: mist
  label:           '#1A1714',  // warm near-black — alias: carbon
  secondary:       '#9C9790',  // warm medium gray — alias: drift
  muted:           '#9C9790',  // alias: drift
  separator:       '#E0DBD4',  // alias: mist
  divider:         '#E0DBD4',  // alias: mist
  inputBorder:     '#E0DBD4',  // alias: mist

  // Interactive — carbon only. No blue. No color accent.
  accent:          '#1A1714',
  accentLight:     '#1A1714',

  // Active chrome (pills, tabs, filters)
  activePill:      '#1A1714',  // dark fill
  activePillText:  '#FFFFFF',  // white text on dark pill

  // Semantic aliases (backward compat)
  green:   '#5A8A6E',
  red:     '#B85C5C',
  gold:    '#B8943E',
  amber:   '#B8943E',

  // Legacy color aliases — collapse to carbon or nearest semantic
  blue:    '#1A1714',
  purple:  '#1A1714',
  cyan:    '#1A1714',
  orange:  '#B8943E',          // → caution
  pink:    '#B85C5C',          // → heat
  teal:    '#5A8A6E',          // → gain

  // UI chrome
  dotActive:    '#1A1714',
  dotInactive:  'rgba(26,23,20,0.20)',
  footer:       '#FFFFFF',     // matches bg
  footerDivider:'#E0DBD4',

  // Chat bubbles (Nexus)
  bubbleSent:     '#1A1714',   // user message bg: carbon
  bubbleReceived: '#F5F0EA',   // nexus message bg: warm linen
} as const;

export const DARK_PALETTE = {
  // ── Core palette ──────────────────────────────────────────────────────────
  paper:   '#1C1410',          // warm near-black bg
  linen:   '#261D17',          // warm dark surfaces
  mist:    '#3D352E',          // warm dark separator
  drift:   '#8A837C',          // warm secondary text
  carbon:  '#F0E8DC',          // warm near-white text
  ember:   '#E08B6A',          // badges, live indicators

  // ── Semantic ──────────────────────────────────────────────────────────────
  gain:    '#6B9E80',          // muted green on dark
  heat:    '#D47A7A',          // muted red on dark
  caution: '#D4AE5A',          // muted amber on dark

  // ── Named aliases ─────────────────────────────────────────────────────────
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

  // Interactive
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
