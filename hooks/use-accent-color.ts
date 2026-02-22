import { useMode } from '@/context/app-context';
import { MODE_ACCENT, MODE_ACCENT_SECONDARY } from '@/constants/theme';

/**
 * Returns the primary accent color for the current org mode.
 */
export function useAccentColor(): string {
  const mode = useMode();
  return MODE_ACCENT[mode];
}

/**
 * Returns both primary and secondary accent colors for the current org mode.
 */
export function useAccentColors(): { primary: string; secondary: string } {
  const mode = useMode();
  return {
    primary: MODE_ACCENT[mode],
    secondary: MODE_ACCENT_SECONDARY[mode],
  };
}
