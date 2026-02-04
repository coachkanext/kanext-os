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
  primary: '#0A0A0A',
  // Nexus accent
  nexus: '#6366F1',
  // Success / positive
  success: '#10B981',
  // Warning
  warning: '#F59E0B',
  // Error / destructive
  error: '#EF4444',
};

// =============================================================================
// MODE ACCENT COLORS
// =============================================================================

export const ModeColors: Record<Mode, { primary: string; secondary: string }> = {
  sports: {
    primary: '#0A7EA4',
    secondary: '#06B6D4',
  },
  enterprise: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
  },
  church: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
  },
  education: {
    primary: '#059669',
    secondary: '#10B981',
  },
};

// =============================================================================
// BASE COLORS
// =============================================================================

export const Colors = {
  light: {
    // Core
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F1F3F5',

    // Borders & Dividers
    border: '#E9ECEF',
    borderStrong: '#DEE2E6',
    divider: '#E9ECEF',

    // Interactive
    tint: Brand.nexus,
    icon: '#687076',
    iconActive: '#11181C',

    // Tab Bar
    tabBar: '#FFFFFF',
    tabIconDefault: '#687076',
    tabIconSelected: Brand.nexus,

    // Cards & Surfaces
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    scrim: 'rgba(0, 0, 0, 0.3)',

    // Status
    success: Brand.success,
    warning: Brand.warning,
    error: Brand.error,
  },
  dark: {
    // Core
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#687076',
    background: '#0A0A0A',
    backgroundSecondary: '#151718',
    backgroundTertiary: '#1C1E1F',

    // Borders & Dividers
    border: '#2D2F30',
    borderStrong: '#3D3F40',
    divider: '#2D2F30',

    // Interactive
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    iconActive: '#ECEDEE',

    // Tab Bar
    tabBar: '#0A0A0A',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',

    // Cards & Surfaces
    card: '#151718',
    cardElevated: '#1C1E1F',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    scrim: 'rgba(0, 0, 0, 0.5)',

    // Status
    success: Brand.success,
    warning: Brand.warning,
    error: Brand.error,
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
