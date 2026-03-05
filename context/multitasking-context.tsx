/**
 * Multitasking Context
 * Tracks open screens for the multitasking overlay (swipe-up from semi-circle).
 * Max 8 screens, oldest auto-evicted. Home is never added.
 */

import React, { createContext, useContext, useCallback, useState } from 'react';
import type { IconSymbolName } from '@/components/ui/icon-symbol';

export interface MultitaskingScreen {
  id: string;
  route: string;
  title: string;
  icon: IconSymbolName;
  timestamp: number;
}

interface MultitaskingContextValue {
  screens: MultitaskingScreen[];
  addScreen: (screen: Omit<MultitaskingScreen, 'timestamp'>) => void;
  removeScreen: (id: string) => void;
  clearAll: () => void;
}

const MultitaskingContext = createContext<MultitaskingContextValue>({
  screens: [],
  addScreen: () => {},
  removeScreen: () => {},
  clearAll: () => {},
});

const MAX_SCREENS = 8;

export function MultitaskingProvider({ children }: { children: React.ReactNode }) {
  const [screens, setScreens] = useState<MultitaskingScreen[]>([]);

  const addScreen = useCallback((screen: Omit<MultitaskingScreen, 'timestamp'>) => {
    setScreens((prev) => {
      // Deduplicate by route — update timestamp if already exists
      const filtered = prev.filter((s) => s.route !== screen.route);
      const next = [{ ...screen, timestamp: Date.now() }, ...filtered];
      // Evict oldest if over max
      return next.slice(0, MAX_SCREENS);
    });
  }, []);

  const removeScreen = useCallback((id: string) => {
    setScreens((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setScreens([]);
  }, []);

  return (
    <MultitaskingContext.Provider value={{ screens, addScreen, removeScreen, clearAll }}>
      {children}
    </MultitaskingContext.Provider>
  );
}

export function useMultitasking() {
  return useContext(MultitaskingContext);
}
