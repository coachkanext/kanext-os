/**
 * useColors — Central color palette hook.
 * Returns the correct palette based on resolved color scheme.
 * All component files import { useColors, type ComponentColors } from here.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfacePressed: 'rgba(0,0,0,0.06)',
  label: '#0D0D0D',
  secondary: '#6E6E80',
  muted: '#8E8EA0',
  separator: 'rgba(0,0,0,0.06)',
  divider: '#E5E5EA',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#8E8EA0',
  amber: '#8E8EA0',
  purple: '#8E8EA0',
  cyan: '#8E8EA0',
  orange: '#8E8EA0',
  pink: '#8E8EA0',
  teal: '#8E8EA0',
  dotActive: '#0D0D0D',
  dotInactive: '#D9D9E3',
  footer: '#FFFFFF',
  footerDivider: 'rgba(0,0,0,0.08)',
  bubbleSent: '#FFFFFF',
  bubbleReceived: '#EFEFEF',
} as const;

export const DARK_PALETTE = {
  bg: '#212121',
  surface: '#2F2F2F',
  surfacePressed: 'rgba(0,0,0,0.3)',
  label: '#ECECF1',
  secondary: '#8E8EA0',
  muted: '#6E6E80',
  separator: 'rgba(255,255,255,0.08)',
  divider: '#3A3A3A',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#8E8EA0',
  amber: '#8E8EA0',
  purple: '#8E8EA0',
  cyan: '#8E8EA0',
  orange: '#8E8EA0',
  pink: '#8E8EA0',
  teal: '#8E8EA0',
  dotActive: '#ECECF1',
  dotInactive: '#4A4A4A',
  footer: '#212121',
  footerDivider: 'rgba(255,255,255,0.08)',
  bubbleSent: '#2F2F2F',
  bubbleReceived: '#3A3A3A',
} as const;

export type ComponentColors = typeof LIGHT_PALETTE;

const palettes = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export function useColors(): ComponentColors {
  const scheme = useColorScheme();
  return palettes[scheme];
}
