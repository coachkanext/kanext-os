/**
 * Church Context — Church Mode state
 * 12-level RBAC via ChurchRoleLens (C0–C11).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { ChurchRoleLens } from '@/utils/church-rbac';

interface ChurchContextValue {
  /** 12-level RBAC: C0 (System Owner) through C11 (Visitor). See church-rbac.ts for full mapping. */
  viewAsRole: ChurchRoleLens;
  setViewAsRole: (role: ChurchRoleLens) => void;
}

const ChurchContext = createContext<ChurchContextValue | null>(null);

export function ChurchProvider({ children }: { children: React.ReactNode }) {
  const [viewAsRole, setViewAsRoleState] = useState<ChurchRoleLens>('C1');

  const handleSetViewAs = useCallback((role: ChurchRoleLens) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewAsRoleState(role);
  }, []);

  return (
    <ChurchContext.Provider
      value={{
        viewAsRole,
        setViewAsRole: handleSetViewAs,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
}

export function useChurch(): ChurchContextValue {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error('useChurch must be used within ChurchProvider');
  return ctx;
}
