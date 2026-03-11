/**
 * Theme Preference Context — persists user's theme choice.
 * State: 'light' | 'dark' | 'system', default 'light'.
 * Persisted to AsyncStorage key @kanext_theme.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kanext_theme';

type ThemePref = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  preference: ThemePref;
  setPreference: (pref: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: 'light',
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePref>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setPreferenceState(val);
      }
    });
  }, []);

  const setPreference = useCallback((pref: ThemePref) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference(): ThemePref {
  return useContext(ThemeContext).preference;
}

export function useSetThemePreference(): (pref: ThemePref) => void {
  return useContext(ThemeContext).setPreference;
}
