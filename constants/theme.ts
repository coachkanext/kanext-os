/**
 * KaNeXT OS Theme System
 * UI PALETTE — Luxury Control Room (Power-First) — LOCKED
 * Gold as primary accent. Dark-first only. Hairlines everywhere.
 */

import { Platform } from 'react-native';
import type { Mode } from '@/types';

// =============================================================================
// BRAND COLORS
// =============================================================================

export const Brand = {
  // Primary accent (White — monochrome authority)
  primary: '#FFFFFF',
  // Precision accent (Ice Blue)
  precision: '#6AA9FF',
  // Nexus accent (alias for precision — used by Nexus UI components)
  nexus: '#6AA9FF',
  // Success / positive (Emerald)
  success: '#22C55E',
  // Warning (Amber)
  warning: '#F59E0B',
  // Error / destructive (Red)
  error: '#EF4444',
};

// =============================================================================
// MODE ACCENT COLORS
// =============================================================================

export const ModeColors: Record<Mode, { primary: string; secondary: string; nexusGlyph: string; nexusGlyphDim: string }> = {
  sports: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  enterprise: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  church: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  education: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  business: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
  competition: {
    primary: '#FFFFFF',
    secondary: '#8F8F8F',
    nexusGlyph: '#FFFFFF',
    nexusGlyphDim: '#8F8F8F',
  },
};

// =============================================================================
// BASE COLORS — Luxury Control Room
// =============================================================================

const palette = {
  // Core Surfaces — Monochrome Silver
  text: '#DDDDDD',               // Heading color
  textSecondary: '#8F8F8F',      // Body color
  textTertiary: '#424242',       // Muted / tertiary
  background: '#000000',         // Page background (jet black)
  backgroundSecondary: '#0E0C0C', // Panel BG
  backgroundTertiary: '#181616',  // Elevated surface

  // Borders & Dividers — hairlines
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.06)',

  // Interactive
  tint: '#FFFFFF',               // Primary accent (white)
  icon: '#8F8F8F',               // Icon Default
  iconActive: '#DDDDDD',

  // Tab Bar
  tabBar: '#000000',
  tabIconDefault: '#424242',
  tabIconSelected: '#FFFFFF',    // White

  // Cards & Surfaces
  card: '#181616',               // Card BG
  cardElevated: '#1E1C1C',      // Elevated Card

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.5)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const Colors = {
  light: { ...palette },
  dark: { ...palette },
};

// =============================================================================
// BUSINESS MODE — Luxury Control Room Palette (Power-First)
// Confidence, authority, restraint, inevitability.
// =============================================================================

export const BusinessPalette = {
  // Core surfaces
  obsidian: '#000000',        // Primary background (jet black)
  carbon: '#181616',          // Cards / sheets
  graphite: 'rgba(255,255,255,0.08)', // Hairline borders
  smoke: '#DDDDDD',           // Primary text (heading)
  ash: '#8F8F8F',             // Secondary text (body)

  // Monochrome accents
  champagneGold: '#FFFFFF',   // Primary accent: highlights, key stats, selected
  platinum: '#8F8F8F',        // Secondary accent: icons, dividers, badges

  // Signal colors
  emerald: '#2FE38C',         // Success / green light
  amber: '#FFB020',           // Warning / watch
  red: '#FF4D4D',             // Critical

  // Interaction surfaces
  glass: 'rgba(255,255,255,0.04)',  // Hover / pressed
  sheetBackdrop: 'rgba(0,0,0,0.55)', // Modal dim
};

// =============================================================================
// FONTS
// =============================================================================

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// =============================================================================
// SPACING
// =============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// =============================================================================
// LAYOUT
// =============================================================================

export const Layout = {
  // Top bar height
  topBarHeight: 56,
  // Tab bar height
  tabBarHeight: 96,
  // Avatar size in top bar
  avatarSize: 32,
  // Max content width (for tablets/web)
  maxContentWidth: 600,
};
