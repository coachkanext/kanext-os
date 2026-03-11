/**
 * useColorScheme — resolves theme preference to 'light' | 'dark'.
 * Reads from ThemeContext: 'light' → 'light', 'dark' → 'dark', 'system' → RN's useColorScheme().
 * Default 'light' when no context (SSR/pre-mount).
 */

import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemePreference } from '@/context/theme-context';

export function useColorScheme(): 'light' | 'dark' {
  const preference = useThemePreference();
  const systemScheme = useRNColorScheme();

  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}
