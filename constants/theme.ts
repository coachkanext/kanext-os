/**
 * KaNeXT OS Theme System
 * Defines colors, fonts, and mode-specific theming for light and dark modes.
 */

import { Platform } from 'react-native';
import type { Mode } from '@/types';

// =============================================================================
// BRAND COLORS
// =============================================================================

export const Brand = {
  // Primary brand color
  primary: '#000000',
  // Nexus accent
  nexus: '#ffffff',
  // Success / positive
  success: '#f5f5f5',
  // Warning
  warning: '#6e6e6e',
  // Error / destructive
  error: '#EF4444',
};

// =============================================================================
// MODE ACCENT COLORS
// =============================================================================

export const ModeColors: Record<Mode, { primary: string; secondary: string }> = {
  sports: {
    primary: '#ffffff',
    secondary: '#6e6e6e',
  },
  enterprise: {
    primary: '#ffffff',
    secondary: '#6e6e6e',
  },
  church: {
    primary: '#ffffff',
    secondary: '#6e6e6e',
  },
  education: {
    primary: '#ffffff',
    secondary: '#6e6e6e',
  },
};

// =============================================================================
// BASE COLORS
// =============================================================================

export const Colors = {
  light: {
    // Core — mirrors dark (forced dark mode)
    text: '#f5f5f5',
    textSecondary: '#6e6e6e',
    textTertiary: '#555555',
    background: '#0f0f0f',
    backgroundSecondary: '#181818',
    backgroundTertiary: '#1e1e1e',

    // Borders & Dividers
    border: '#2a2a2a',
    borderStrong: '#2a2a2a',
    divider: '#2a2a2a',

    // Interactive
    tint: '#ffffff',
    icon: '#6e6e6e',
    iconActive: '#f5f5f5',

    // Tab Bar
    tabBar: '#0f0f0f',
    tabIconDefault: '#6e6e6e',
    tabIconSelected: '#ffffff',

    // Cards & Surfaces
    card: '#181818',
    cardElevated: '#181818',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    scrim: 'rgba(0, 0, 0, 0.5)',

    // Status
    success: '#f5f5f5',
    warning: '#6e6e6e',
    error: '#EF4444',
  },
  dark: {
    // Core
    text: '#f5f5f5',
    textSecondary: '#6e6e6e',
    textTertiary: '#555555',
    background: '#0f0f0f',
    backgroundSecondary: '#181818',
    backgroundTertiary: '#1e1e1e',

    // Borders & Dividers
    border: '#2a2a2a',
    borderStrong: '#2a2a2a',
    divider: '#2a2a2a',

    // Interactive
    tint: '#ffffff',
    icon: '#6e6e6e',
    iconActive: '#f5f5f5',

    // Tab Bar
    tabBar: '#0f0f0f',
    tabIconDefault: '#6e6e6e',
    tabIconSelected: '#ffffff',

    // Cards & Surfaces
    card: '#181818',
    cardElevated: '#181818',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    scrim: 'rgba(0, 0, 0, 0.5)',

    // Status
    success: '#f5f5f5',
    warning: '#6e6e6e',
    error: '#EF4444',
  },
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
  tabBarHeight: 80,
  // Avatar size in top bar
  avatarSize: 32,
  // Max content width (for tablets/web)
  maxContentWidth: 600,
};
