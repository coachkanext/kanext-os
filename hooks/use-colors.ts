/**
 * useColors — Central color palette hook.
 * Returns the correct palette based on resolved color scheme.
 * All component files import { useColors, type ComponentColors } from here.
 *
 * Palette: Section 13 of KaNeXT_Product_Knowledge.md (canonical spec).
 * Light: pure white BG, Apple gray surface, #3B82F6 primary.
 * Dark: OLED true black, #1A1A1A surface, #60A5FA primary.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

export const LIGHT_PALETTE = {
  bg: '#FFFFFF',
  surface: '#F5F5F7',
  surfacePressed: 'rgba(0,0,0,0.04)',
  label: '#111111',
  secondary: '#6B7280',
  muted: '#9CA3AF',
  separator: '#E5E7EB',
  divider: '#E5E7EB',
  inputBorder: '#D1D5DB',
  // Primary / accent
  accent: '#3B82F6',        // electric blue — primary interactive
  accentLight: '#60A5FA',   // soft blue
  // Semantic
  green: '#22C55E',
  red: '#EF4444',
  gold: '#C5A55A',
  amber: '#F59E0B',
  // Legacy aliases — keeps existing components working without edits
  blue: '#3B82F6',
  purple: '#3B82F6',
  cyan: '#60A5FA',
  orange: '#F59E0B',
  pink: '#EF4444',
  teal: '#22C55E',
  // UI chrome
  dotActive: '#111111',
  dotInactive: 'rgba(0,0,0,0.15)',
  footer: '#FFFFFF',
  footerDivider: '#E5E7EB',
  // Chat bubbles
  bubbleSent: '#F5F5F7',
  bubbleReceived: 'rgba(0,0,0,0.04)',
} as const;

export const DARK_PALETTE = {
  bg: '#000000',
  surface: '#1A1A1A',
  surfacePressed: 'rgba(255,255,255,0.06)',
  label: '#F5F5F7',
  secondary: '#6B7280',
  muted: '#4B5563',
  separator: '#2A2A2A',
  divider: '#2A2A2A',
  inputBorder: '#333333',
  // Primary / accent
  accent: '#60A5FA',        // soft blue — primary interactive in dark
  accentLight: '#93C5FD',
  // Semantic
  green: '#4ADE80',
  red: '#F87171',
  gold: '#D4B96A',
  amber: '#FBBF24',
  // Legacy aliases
  blue: '#60A5FA',
  purple: '#60A5FA',
  cyan: '#93C5FD',
  orange: '#FBBF24',
  pink: '#F87171',
  teal: '#4ADE80',
  // UI chrome
  dotActive: '#F5F5F7',
  dotInactive: 'rgba(255,255,255,0.15)',
  footer: '#000000',
  footerDivider: '#2A2A2A',
  // Chat bubbles
  bubbleSent: '#1A1A1A',
  bubbleReceived: 'rgba(255,255,255,0.06)',
} as const;

export type ComponentColors = typeof LIGHT_PALETTE;

const palettes = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export function useColors(): ComponentColors {
  const scheme = useColorScheme();
  return palettes[scheme];
}
