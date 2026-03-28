/**
 * useColors — Central color palette hook.
 * Returns the correct palette based on resolved color scheme.
 * All component files import { useColors, type ComponentColors } from here.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  bg: '#F5EFE4',
  surface: '#EDE5D8',
  surfacePressed: 'rgba(139,99,67,0.08)',
  label: '#1A1714',
  secondary: 'rgba(45,30,18,0.50)',
  muted: 'rgba(45,30,18,0.30)',
  separator: 'rgba(139,99,67,0.10)',
  divider: 'rgba(139,99,67,0.10)',
  inputBorder: 'rgba(139,99,67,0.18)',
  // Three accent colors — no others
  accent: '#D97757',   // Claude coral-orange
  green: '#5A8A6E',    // positive sage green
  red: '#B85C5C',      // negative dusty red
  // Legacy keys mapped to nearest accent — avoids breaking components
  blue: '#D97757',
  amber: '#D97757',
  purple: '#D97757',
  cyan: '#D97757',
  orange: '#D97757',
  pink: '#B85C5C',
  teal: '#5A8A6E',
  dotActive: '#1A1714',
  dotInactive: 'rgba(45,30,18,0.15)',
  footer: '#EDE5D8',
  footerDivider: 'rgba(139,99,67,0.18)',
  bubbleSent: '#EDE5D8',
  bubbleReceived: 'rgba(139,99,67,0.08)',
} as const;

export const DARK_PALETTE = {
  bg: '#1C1410',
  surface: '#261D17',
  surfacePressed: 'rgba(217,119,87,0.10)',
  label: '#F0E8DC',
  secondary: 'rgba(240,232,220,0.50)',
  muted: 'rgba(240,232,220,0.30)',
  separator: 'rgba(217,119,87,0.12)',
  divider: 'rgba(217,119,87,0.12)',
  inputBorder: 'rgba(217,119,87,0.20)',
  accent: '#E08B6A',
  green: '#6FA882',
  red: '#C97070',
  blue: '#E08B6A',
  amber: '#E08B6A',
  purple: '#E08B6A',
  cyan: '#E08B6A',
  orange: '#E08B6A',
  pink: '#C97070',
  teal: '#6FA882',
  dotActive: '#F0E8DC',
  dotInactive: 'rgba(240,232,220,0.15)',
  footer: '#261D17',
  footerDivider: 'rgba(217,119,87,0.20)',
  bubbleSent: '#261D17',
  bubbleReceived: 'rgba(217,119,87,0.10)',
} as const;

export type ComponentColors = typeof LIGHT_PALETTE;

const palettes = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export function useColors(): ComponentColors {
  const scheme = useColorScheme();
  return palettes[scheme];
}
