/**
 * KaNeXT OS — Global Theme
 *
 * Light and dark palettes. Follows iOS system setting via useColorScheme().
 * Per-org accent colors via MODE_ACCENT / MODE_ACCENT_SECONDARY (same in both themes).
 * KaNeXT Blue (#1A1714) is the system/infrastructure fallback only.
 *
 * Dark:  Background #000000, Surface #0B0F14, Text #FFFFFF
 * Light: Background #FFFFFF, Surface #F2F2F7, Text #000000
 * System accent: #1A1714 (login, onboarding, Nexus)
 */

import { Platform } from 'react-native';
import type { Mode } from '@/types';

// =============================================================================
// BRAND COLORS
// =============================================================================

export const Brand = {
  /** KaNeXT Carbon — monochrome. No accent color. */
  primary: '#1A1714',
  /** Alias for primary */
  precision: '#1A1714',
  /** Alias for primary — used by Nexus UI components */
  nexus: '#1A1714',
  /** Success / positive — Gain (muted sage) */
  success: '#5A8A6E',
  /** Warning — Caution (muted amber) */
  warning: '#B8943E',
  /** Error / destructive — Heat (muted burgundy) */
  error: '#B85C5C',
};

// =============================================================================
// MODE COLORS — Uniform across all modes (no per-mode variation)
// =============================================================================

const uniformMode = {
  primary: '#FFFFFF',
  secondary: '#9C9790',
  nexusGlyph: '#FFFFFF',
  nexusGlyphDim: '#9C9790',
};

export const ModeColors: Record<Mode, { primary: string; secondary: string; nexusGlyph: string; nexusGlyphDim: string }> = {
  sports: { ...uniformMode },
  community: { ...uniformMode },
  education: { ...uniformMode },
  business: { ...uniformMode },
  personal: { ...uniformMode },
};

// =============================================================================
// MODE ACCENT — Per-org primary accent colors
// =============================================================================

// MODE ACCENT — All Carbon. No per-mode colors. Monochrome system.
export const MODE_ACCENT: Record<Mode, string> = {
  sports:     '#1A1714',
  business:   '#1A1714',
  community:  '#1A1714',
  education:  '#1A1714',
  personal:   '#1A1714',
};

export const MODE_ACCENT_SECONDARY: Record<Mode, string> = {
  sports:     '#1A1714',
  business:   '#1A1714',
  community:  '#1A1714',
  education:  '#1A1714',
  personal:   '#1A1714',
};

// =============================================================================
// BASE COLORS — Light & Dark Palettes
// =============================================================================

const darkPalette = {
  // Text — Carbon dark (#F0E8DC) / Drift dark (#8A837C)
  text: '#F0E8DC',
  textSecondary: '#8A837C',
  textTertiary: '#8A837C',

  // Backgrounds — Paper dark / Linen dark
  background: '#1C1410',
  backgroundSecondary: '#261D17',
  backgroundTertiary: '#261D17',

  // Borders & Dividers — Mist dark
  border: '#3D352E',
  borderStrong: '#3D352E',
  divider: '#3D352E',

  // Interactive — Carbon dark
  tint: '#F0E8DC',
  icon: '#8A837C',
  iconActive: '#F0E8DC',

  // Tab Bar
  tabBar: '#1C1410',
  tabIconDefault: '#8A837C',
  tabIconSelected: '#F0E8DC',

  // Cards & Surfaces — Linen dark
  card: '#261D17',
  cardElevated: '#261D17',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.5)',

  // Status — semantic only
  success: '#6B9E80',
  warning: '#D4AE5A',
  error: '#D47A7A',
};

const lightPalette = {
  // Text — Carbon (#1A1714) / Drift (#9C9790)
  text: '#1A1714',
  textSecondary: '#9C9790',
  textTertiary: '#9C9790',

  // Backgrounds — Paper / Linen
  background: '#FFFFFF',
  backgroundSecondary: '#F5F0EA',
  backgroundTertiary: '#F5F0EA',

  // Borders & Dividers — Mist
  border: '#E0DBD4',
  borderStrong: '#E0DBD4',
  divider: '#E0DBD4',

  // Interactive — Carbon
  tint: '#1A1714',
  icon: '#9C9790',
  iconActive: '#1A1714',

  // Tab Bar
  tabBar: '#FFFFFF',
  tabIconDefault: '#9C9790',
  tabIconSelected: '#1A1714',

  // Cards & Surfaces — Linen
  card: '#F5F0EA',
  cardElevated: '#FFFFFF',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  scrim: 'rgba(0, 0, 0, 0.3)',

  // Status — semantic only
  success: '#5A8A6E',
  warning: '#B8943E',
  error: '#B85C5C',
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
  obsidian: '#1A1714',
  carbon: '#1A1714',
  graphite: '#3D352E',
  smoke: '#FFFFFF',
  ash: '#9C9790',
  champagneGold: '#1A1714',
  platinum: '#9C9790',
  emerald: '#5A8A6E',
  amber: '#B8943E',
  red: '#B85C5C',
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
