/**
 * KaNeXT OS — Global Theme
 *
 * Light and dark palettes. Follows iOS system setting via useColorScheme().
 * Per-org accent colors via MODE_ACCENT / MODE_ACCENT_SECONDARY (same in both themes).
 * KaNeXT Blue (#1D9BF0) is the system/infrastructure fallback only.
 *
 * Dark:  Background #000000, Surface #0B0F14, Text #FFFFFF
 * Light: Background #FFFFFF, Surface #F2F2F7, Text #000000
 * System accent: #1D9BF0 (login, onboarding, Nexus)
 */

import { Platform } from 'react-native';
import type { Mode } from '@/types';

// =============================================================================
// BRAND COLORS
// =============================================================================

export const Brand = {
  /** KaNeXT Blue — the ONLY accent color in the entire OS */
  primary: '#1D9BF0',
  /** Alias for primary accent */
  precision: '#1D9BF0',
  /** Alias for primary accent — used by Nexus UI components */
  nexus: '#1D9BF0',
  /** Success / positive */
  success: '#22C55E',
  /** Warning */
  warning: '#F59E0B',
  /** Error / destructive */
  error: '#EF4444',
};

// =============================================================================
// MODE COLORS — Uniform across all modes (no per-mode variation)
// =============================================================================

const uniformMode = {
  primary: '#FFFFFF',
  secondary: '#A1A1AA',
  nexusGlyph: '#FFFFFF',
  nexusGlyphDim: '#A1A1AA',
};

export const ModeColors: Record<Mode, { primary: string; secondary: string; nexusGlyph: string; nexusGlyphDim: string }> = {
  sports: { ...uniformMode },
  church: { ...uniformMode },
  education: { ...uniformMode },
  business: { ...uniformMode },
};

// =============================================================================
// MODE ACCENT — Per-org primary accent colors
// =============================================================================

export const MODE_ACCENT: Record<Mode, string> = {
  sports:      '#990000',   // Lincoln University Maroon
  business:    '#1D9BF0',   // KaNeXT Blue
  church:      '#0081CA',   // ICC Blue
  education:   '#003A63',   // Howard Navy
};

// =============================================================================
// MODE ACCENT SECONDARY — Per-org secondary accent colors
// =============================================================================

export const MODE_ACCENT_SECONDARY: Record<Mode, string> = {
  sports:      '#DFA414',   // Lincoln University Gold
  business:    '#1D9BF0',   // KaNeXT Blue (same)
  church:      '#004C7A',   // ICC Navy
  education:   '#E51937',   // Howard Crimson
};

// =============================================================================
// BASE COLORS — Light & Dark Palettes
// =============================================================================

const darkPalette = {
  // Text
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#52525B',

  // Backgrounds
  background: '#000000',
  backgroundSecondary: '#0B0F14',
  backgroundTertiary: '#0B0F14',

  // Borders & Dividers
  border: '#2F3336',
  borderStrong: '#2F3336',
  divider: '#2F3336',

  // Interactive
  tint: '#1D9BF0',
  icon: '#A1A1AA',
  iconActive: '#FFFFFF',

  // Tab Bar
  tabBar: '#000000',
  tabIconDefault: '#A1A1AA',
  tabIconSelected: '#1D9BF0',

  // Cards & Surfaces
  card: '#0B0F14',
  cardElevated: '#0B0F14',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.5)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

const lightPalette = {
  // Text
  text: '#000000',
  textSecondary: '#636366',
  textTertiary: '#AEAEB2',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#E5E5EA',

  // Borders & Dividers
  border: '#D1D1D6',
  borderStrong: '#C7C7CC',
  divider: '#D1D1D6',

  // Interactive
  tint: '#1D9BF0',
  icon: '#8E8E93',
  iconActive: '#000000',

  // Tab Bar
  tabBar: '#FFFFFF',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#1D9BF0',

  // Cards & Surfaces
  card: '#F2F2F7',
  cardElevated: '#FFFFFF',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  scrim: 'rgba(0, 0, 0, 0.3)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const Colors = {
  light: lightPalette,
  dark: darkPalette,
};

// =============================================================================
// LEGACY ALIAS — BusinessPalette mapped to global theme
// Used by business components via `const BP = BusinessPalette;`
// =============================================================================

export const BusinessPalette = {
  obsidian: '#000000',
  carbon: '#0B0F14',
  graphite: '#2F3336',
  smoke: '#FFFFFF',
  ash: '#A1A1AA',
  champagneGold: MODE_ACCENT.business,
  platinum: '#A1A1AA',
  emerald: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  glass: 'rgba(255,255,255,0.04)',
  sheetBackdrop: 'rgba(0,0,0,0.55)',
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
  topBarHeight: 56,
  tabBarHeight: 96,
  avatarSize: 32,
  maxContentWidth: 600,
};
