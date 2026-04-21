/**
 * useColors — KaNeXT Design System palette hook.
 *
 * Visual language: Warm Linen — paper whites, warm linen surfaces, carbon text. No blue.
 * Light: white bg, warm linen surfaces, carbon text, no accent color.
 * Dark:  deep brown-black bg, warm dark surfaces, warm white text.
 *
 * Core tokens: bg / surface / surface2 / surface3 / label / secondary / muted
 * Semantic (data values only): gain / heat / caution
 * Chrome: ember (notification badges + live dots ONLY)
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  // ── Core surfaces ──────────────────────────────────────────────────────────
  bg:              '#FFFFFF',          // paper: page / screen background
  surface:         '#F5F0EA',          // linen: tiles, cards, sidebar bg
  surface2:        '#EAE5DD',          // between linen and mist: inputs, pills, switchers
  surface3:        '#E0DBD4',          // mist: overlays, modals, dropdowns

  // ── Text ──────────────────────────────────────────────────────────────────
  label:           '#1A1714',          // carbon: headings, tile labels, nav labels
  secondary:       '#9C9790',          // drift: subtitles, section headers, inactive icons
  muted:           '#9C9790',          // alias: secondary / drift

  // ── Accent (carbon — no blue ever) ────────────────────────────────────────
  accent:          '#1A1714',          // carbon: active icons, links, CTAs
  accentBranded:   '#1A1714',          // carbon: branded buttons, K logo mark
  accentLight:     '#1A1714',

  // ── Borders / separators ──────────────────────────────────────────────────
  borderLight:     'rgba(26,23,20,0.06)',
  borderMedium:    'rgba(26,23,20,0.12)',
  separator:       '#E0DBD4',          // mist as solid separator
  mist:            '#E0DBD4',          // mist color token
  divider:         '#E0DBD4',
  cardBorder:      '#E0DBD4',
  inputBorder:     'rgba(26,23,20,0.10)',

  // ── Press state ───────────────────────────────────────────────────────────
  surfacePressed:  'rgba(26,23,20,0.05)',

  // ── Status — semantic data values & indicators ONLY ───────────────────────
  gain:            '#5A8A6E',          // green: positive data values
  gainBg:          '#E8F2EC',
  heat:            '#B85C5C',          // red: negative data values
  heatBg:          '#F5E8E8',
  caution:         '#B8943E',          // amber: caution data values
  cautionBg:       '#F5EDD9',

  // Convenience aliases for pill patterns
  successBg:       '#E8F2EC',
  dangerBg:        '#F5E8E8',
  warningBg:       '#F5EDD9',

  // ── Active chrome (pills, tabs, filters) ──────────────────────────────────
  activePill:      '#1A1714',          // carbon fill on active pill
  activePillText:  '#FFFFFF',          // paper text on active pill

  // ── Ember (notification badges + live dots ONLY) ──────────────────────────
  ember:           '#8B2500',

  // ── UI chrome ─────────────────────────────────────────────────────────────
  dotActive:       '#1A1714',          // carbon: active nav indicator
  dotInactive:     'rgba(26,23,20,0.20)',
  footer:          '#FFFFFF',
  footerDivider:   '#E0DBD4',

  // ── Chat bubbles (Nexus) ──────────────────────────────────────────────────
  bubbleSent:      '#1A1714',          // carbon bg: user message
  bubbleReceived:  '#F5F0EA',          // linen bg: AI message

  // ── Legacy aliases ────────────────────────────────────────────────────────
  paper:           '#FFFFFF',
  linen:           '#F5F0EA',
  drift:           '#9C9790',
  carbon:          '#1A1714',
  green:           '#5A8A6E',
  red:             '#B85C5C',
  gold:            '#B8943E',
  amber:           '#B8943E',
  blue:            '#1A1714',          // no blue — maps to carbon
  purple:          '#1A1714',
  cyan:            '#1A1714',
  orange:          '#B8943E',
  pink:            '#B85C5C',
  teal:            '#5A8A6E',
} as const;

export const DARK_PALETTE = {
  // ── Core surfaces ──────────────────────────────────────────────────────────
  bg:              '#1C1410',          // paper dark: deep warm brown-black
  surface:         '#261D17',          // linen dark: surface-1
  surface2:        '#2F2820',          // between linen and mist dark
  surface3:        '#3D352E',          // mist dark: overlays, modals

  // ── Text ──────────────────────────────────────────────────────────────────
  label:           '#F0E8DC',          // carbon dark: warm white
  secondary:       '#8A837C',          // drift dark
  muted:           '#8A837C',

  // ── Accent (carbon dark — no blue ever) ───────────────────────────────────
  accent:          '#F0E8DC',          // carbon dark
  accentBranded:   '#F0E8DC',
  accentLight:     '#F0E8DC',

  // ── Borders / separators ──────────────────────────────────────────────────
  borderLight:     'rgba(240,232,220,0.06)',
  borderMedium:    'rgba(240,232,220,0.12)',
  separator:       '#3D352E',          // mist dark as solid separator
  mist:            '#3D352E',
  divider:         '#3D352E',
  cardBorder:      '#3D352E',
  inputBorder:     'rgba(240,232,220,0.10)',

  // ── Press state ───────────────────────────────────────────────────────────
  surfacePressed:  'rgba(240,232,220,0.06)',

  // ── Status ────────────────────────────────────────────────────────────────
  gain:            '#5A8A6E',
  gainBg:          '#1A2E22',
  heat:            '#B85C5C',
  heatBg:          '#2E1A1A',
  caution:         '#B8943E',
  cautionBg:       '#2E2410',

  successBg:       '#1A2E22',
  dangerBg:        '#2E1A1A',
  warningBg:       '#2E2410',

  // ── Active chrome ─────────────────────────────────────────────────────────
  activePill:      '#F0E8DC',          // carbon dark fill on active pill
  activePillText:  '#1C1410',          // paper dark text on active pill

  // ── Ember ─────────────────────────────────────────────────────────────────
  ember:           '#E08B6A',

  // ── UI chrome ─────────────────────────────────────────────────────────────
  dotActive:       '#F0E8DC',          // carbon dark: active nav indicator
  dotInactive:     'rgba(240,232,220,0.20)',
  footer:          '#1C1410',
  footerDivider:   '#3D352E',

  // ── Chat bubbles ──────────────────────────────────────────────────────────
  bubbleSent:      '#F0E8DC',          // carbon dark bg: user message
  bubbleReceived:  '#261D17',          // linen dark bg: AI message

  // ── Legacy aliases ────────────────────────────────────────────────────────
  paper:           '#1C1410',
  linen:           '#261D17',
  drift:           '#8A837C',
  carbon:          '#F0E8DC',
  green:           '#5A8A6E',
  red:             '#B85C5C',
  gold:            '#B8943E',
  amber:           '#B8943E',
  blue:            '#F0E8DC',          // no blue — maps to carbon dark
  purple:          '#F0E8DC',
  cyan:            '#F0E8DC',
  orange:          '#B8943E',
  pink:            '#B85C5C',
  teal:            '#5A8A6E',
} as const;

export type ComponentColors = typeof LIGHT_PALETTE;

const palettes = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export function useColors(): ComponentColors {
  const scheme = useColorScheme();
  return palettes[scheme];
}
