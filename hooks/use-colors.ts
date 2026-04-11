/**
 * useColors — KaNeXT Design System palette hook.
 *
 * Visual language: White & Silver — cool platinum, not warm linen.
 * Light: crisp white cards on cool near-white bg, steel-gray type.
 * Dark:  cool near-black, silver-tinted surfaces, platinum text.
 *
 * Core:    Frost / White / Steel / Slate / Ink / Ember
 * Semantic (data values only): Gain / Heat / Caution
 * No blue accent. Monochrome chrome.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  // ── Core palette ──────────────────────────────────────────────────────────
  paper:   '#EEF0F7',          // primary bg — cool near-white (was warm #FFFFFF)
  linen:   '#FFFFFF',          // cards, tiles, elevated surfaces (was warm linen)
  mist:    '#E2E4ED',          // borders, dividers, separators (was warm beige)
  drift:   '#6B7080',          // secondary text, timestamps, placeholders (cooler)
  carbon:  '#0A0C14',          // primary text, icons, buttons (cool near-black)
  ember:   '#8B2500',          // ONLY: notification badges, live indicators

  // ── Semantic — data values only ───────────────────────────────────────────
  gain:    '#1A7A4A',          // positive data, confirmed, success — deeper on white
  heat:    '#B83030',          // negative data, error, destructive — deeper on white
  caution: '#B07B00',          // warning, pending — deeper amber on white

  // ── Named aliases ─────────────────────────────────────────────────────────
  bg:              '#EEF0F7',  // cool near-white — alias: paper
  surface:         '#FFFFFF',  // pure white cards — alias: linen
  surfacePressed:  'rgba(10,12,20,0.05)',
  cardBorder:      '#E2E4ED',  // cool separator — alias: mist
  label:           '#0A0C14',  // cool near-black — alias: carbon
  secondary:       '#6B7080',  // cool medium gray — alias: drift
  muted:           '#A8AABC',  // lighter silver-gray (tertiary / decorative)
  separator:       '#E2E4ED',  // alias: mist
  divider:         '#E2E4ED',  // alias: mist
  inputBorder:     '#E2E4ED',  // alias: mist

  // Interactive — Ink/carbon only. No blue. No color accent.
  accent:          '#0A0C14',
  accentLight:     '#0A0C14',

  // Active chrome (pills, tabs, filters)
  activePill:      '#0A0C14',  // dark fill
  activePillText:  '#FFFFFF',  // pure white text on dark pill

  // Semantic aliases (backward compat)
  green:   '#1A7A4A',
  red:     '#B83030',
  gold:    '#B07B00',
  amber:   '#B07B00',

  // Legacy color aliases — collapse to carbon or nearest semantic
  blue:    '#0A0C14',
  purple:  '#0A0C14',
  cyan:    '#0A0C14',
  orange:  '#B07B00',          // → caution
  pink:    '#B83030',          // → heat
  teal:    '#1A7A4A',          // → gain

  // UI chrome
  dotActive:    '#0A0C14',
  dotInactive:  'rgba(10,12,20,0.18)',
  footer:       '#EEF0F7',     // matches bg
  footerDivider:'#E2E4ED',

  // Chat bubbles (Nexus)
  bubbleSent:     '#0A0C14',   // user message bg: ink
  bubbleReceived: '#FFFFFF',   // nexus message bg: pure white
} as const;

export const DARK_PALETTE = {
  // ── Core palette ──────────────────────────────────────────────────────────
  paper:   '#0E0F14',          // cool near-black bg (was warm brown)
  linen:   '#15161F',          // cool dark surfaces (was warm dark brown)
  mist:    '#252730',          // cool dark separator (was warm dark gray)
  drift:   '#7A7E92',          // cooler secondary text (was warm gray)
  carbon:  '#E8ECF8',          // cool near-white text (was warm cream)
  ember:   '#E08B6A',          // badges, live indicators (unchanged)

  // ── Semantic ──────────────────────────────────────────────────────────────
  gain:    '#4ADE80',          // vivid green on dark
  heat:    '#EF6060',          // vivid red on dark
  caution: '#F0A030',          // vivid amber on dark

  // ── Named aliases ─────────────────────────────────────────────────────────
  bg:              '#0E0F14',
  surface:         '#15161F',
  surfacePressed:  'rgba(232,236,248,0.06)',
  cardBorder:      '#252730',
  label:           '#E8ECF8',
  secondary:       '#7A7E92',
  muted:           '#55586A',  // darker muted for dark mode
  separator:       '#252730',
  divider:         '#252730',
  inputBorder:     '#252730',

  // Interactive
  accent:          '#E8ECF8',
  accentLight:     '#E8ECF8',

  // Active chrome
  activePill:      '#E8ECF8',
  activePillText:  '#0E0F14',

  // Semantic aliases
  green:   '#4ADE80',
  red:     '#EF6060',
  gold:    '#F0A030',
  amber:   '#F0A030',

  // Legacy aliases
  blue:    '#E8ECF8',
  purple:  '#E8ECF8',
  cyan:    '#E8ECF8',
  orange:  '#F0A030',
  pink:    '#EF6060',
  teal:    '#4ADE80',

  // UI chrome
  dotActive:    '#E8ECF8',
  dotInactive:  'rgba(232,236,248,0.20)',
  footer:       '#0E0F14',
  footerDivider:'#252730',

  // Chat bubbles
  bubbleSent:     '#E8ECF8',
  bubbleReceived: '#15161F',
} as const;

export type ComponentColors = typeof LIGHT_PALETTE;

const palettes = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export function useColors(): ComponentColors {
  const scheme = useColorScheme();
  return palettes[scheme];
}
