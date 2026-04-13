/**
 * useColors — KaNeXT Design System palette hook.
 *
 * Visual language: Blue-Grey system — clean whites, cool surfaces, blue accent.
 * Light: white bg, cool grey surfaces, dark text, blue accent.
 * Dark:  near-black bg, dark cool surfaces, light text, light-blue accent.
 *
 * Core tokens: background / surface-1 / surface-2 / surface-3 / text-primary /
 *              text-secondary / accent-primary / accent-branded
 * Semantic: success / danger / warning (with bg variants)
 * Border:   border-light (rgba) / border-medium (rgba)
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  // ── Core surfaces ──────────────────────────────────────────────────────────
  bg:              '#FFFFFF',          // page / screen background
  surface:         '#F3F4F8',          // surface-1: tiles, cards, sidebar bg
  surface2:        '#E8EAF0',          // surface-2: icon containers, inputs, secondary cards
  surface3:        '#DDE0E8',          // surface-3: overlays, modals, dropdowns

  // ── Text ──────────────────────────────────────────────────────────────────
  label:           '#1A1D26',          // text-primary: headings, tile labels, nav labels
  secondary:       '#6B7085',          // text-secondary: subtitles, section headers, inactive icons
  muted:           '#6B7085',          // alias: secondary

  // ── Accent ────────────────────────────────────────────────────────────────
  accent:          '#2563EB',          // accent-primary: active icons, KR ring, links, CTAs
  accentBranded:   '#1D4ED8',          // accent-branded: branded buttons, K logo mark
  accentLight:     '#2563EB',

  // ── Borders / separators ──────────────────────────────────────────────────
  borderLight:     'rgba(0,0,0,0.06)', // card borders, dividers, nav bar top border
  borderMedium:    'rgba(0,0,0,0.12)', // pill borders, section dividers
  separator:       'rgba(0,0,0,0.06)', // alias: borderLight
  mist:            'rgba(0,0,0,0.06)', // alias: borderLight
  divider:         'rgba(0,0,0,0.06)', // alias: borderLight
  cardBorder:      'rgba(0,0,0,0.06)', // alias: borderLight
  inputBorder:     'rgba(0,0,0,0.08)', // slightly more visible for inputs

  // ── Press state ───────────────────────────────────────────────────────────
  surfacePressed:  'rgba(0,0,0,0.05)',

  // ── Status — semantic data values & indicators ────────────────────────────
  gain:            '#0F6E56',          // status-success: green pills, dots, roster circles
  gainBg:          '#E6F4EE',          // status-success-bg: green pill backgrounds
  heat:            '#A32D2D',          // status-danger: red pills, film room badge
  heatBg:          '#FCEBEB',          // status-danger-bg: red pill backgrounds
  caution:         '#854F0B',          // status-warning: amber dots (roster, compliance)
  cautionBg:       '#FFF8EB',          // status-warning-bg

  // Convenience aliases for pill patterns
  successBg:       '#E6F4EE',
  dangerBg:        '#FCEBEB',
  warningBg:       '#FFF8EB',

  // ── Active chrome (pills, tabs, filters) ──────────────────────────────────
  activePill:      '#1A1D26',          // dark fill on active pill
  activePillText:  '#FFFFFF',          // white text on active pill

  // ── Ember (notification badges) ───────────────────────────────────────────
  ember:           '#A32D2D',          // maps to danger for notification badges

  // ── UI chrome ─────────────────────────────────────────────────────────────
  dotActive:       '#2563EB',          // active nav indicator: accent
  dotInactive:     'rgba(26,29,38,0.20)',
  footer:          '#FFFFFF',
  footerDivider:   'rgba(0,0,0,0.06)',

  // ── Chat bubbles (Nexus) ──────────────────────────────────────────────────
  bubbleSent:      '#1A1D26',          // user message bg
  bubbleReceived:  '#F3F4F8',          // AI message bg

  // ── Legacy aliases (backward compatibility) ───────────────────────────────
  paper:           '#FFFFFF',
  linen:           '#F3F4F8',
  drift:           '#6B7085',
  carbon:          '#1A1D26',
  green:           '#0F6E56',
  red:             '#A32D2D',
  gold:            '#854F0B',
  amber:           '#854F0B',
  blue:            '#2563EB',
  purple:          '#2563EB',
  cyan:            '#2563EB',
  orange:          '#854F0B',
  pink:            '#A32D2D',
  teal:            '#0F6E56',
} as const;

export const DARK_PALETTE = {
  // ── Core surfaces ──────────────────────────────────────────────────────────
  bg:              '#0F1117',
  surface:         '#181B24',          // surface-1
  surface2:        '#1F2330',          // surface-2
  surface3:        '#282D3C',          // surface-3

  // ── Text ──────────────────────────────────────────────────────────────────
  label:           '#E2E4EA',          // text-primary
  secondary:       '#8B8FA0',          // text-secondary
  muted:           '#8B8FA0',

  // ── Accent ────────────────────────────────────────────────────────────────
  accent:          '#4DA3FF',          // accent-primary (lighter blue for dark bg)
  accentBranded:   '#2563EB',          // accent-branded
  accentLight:     '#4DA3FF',

  // ── Borders / separators ──────────────────────────────────────────────────
  borderLight:     'rgba(255,255,255,0.06)',
  borderMedium:    'rgba(255,255,255,0.12)',
  separator:       'rgba(255,255,255,0.06)',
  mist:            'rgba(255,255,255,0.06)',
  divider:         'rgba(255,255,255,0.06)',
  cardBorder:      'rgba(255,255,255,0.06)',
  inputBorder:     'rgba(255,255,255,0.08)',

  // ── Press state ───────────────────────────────────────────────────────────
  surfacePressed:  'rgba(255,255,255,0.06)',

  // ── Status ────────────────────────────────────────────────────────────────
  gain:            '#5DCAA5',
  gainBg:          '#0D2E24',
  heat:            '#F09595',
  heatBg:          '#3D1717',
  caution:         '#FAC775',
  cautionBg:       '#3D2E0F',

  successBg:       '#0D2E24',
  dangerBg:        '#3D1717',
  warningBg:       '#3D2E0F',

  // ── Active chrome ─────────────────────────────────────────────────────────
  activePill:      '#E2E4EA',
  activePillText:  '#0F1117',

  // ── Ember ─────────────────────────────────────────────────────────────────
  ember:           '#F09595',

  // ── UI chrome ─────────────────────────────────────────────────────────────
  dotActive:       '#4DA3FF',
  dotInactive:     'rgba(226,228,234,0.20)',
  footer:          '#0F1117',
  footerDivider:   'rgba(255,255,255,0.06)',

  // ── Chat bubbles ──────────────────────────────────────────────────────────
  bubbleSent:      '#E2E4EA',
  bubbleReceived:  '#181B24',

  // ── Legacy aliases ────────────────────────────────────────────────────────
  paper:           '#0F1117',
  linen:           '#181B24',
  drift:           '#8B8FA0',
  carbon:          '#E2E4EA',
  green:           '#5DCAA5',
  red:             '#F09595',
  gold:            '#FAC775',
  amber:           '#FAC775',
  blue:            '#4DA3FF',
  purple:          '#4DA3FF',
  cyan:            '#4DA3FF',
  orange:          '#FAC775',
  pink:            '#F09595',
  teal:            '#5DCAA5',
} as const;

export type ComponentColors = typeof LIGHT_PALETTE;

const palettes = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export function useColors(): ComponentColors {
  const scheme = useColorScheme();
  return palettes[scheme];
}
