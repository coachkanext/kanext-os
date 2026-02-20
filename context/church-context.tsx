/**
 * Church Context — Church Mode state
 * 11-level RBAC via ChurchRoleLens (C1–C11).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { ChurchRoleLens } from '@/utils/church-rbac';

interface ChurchContextValue {
  /** 11-level RBAC: C1-C5 (original) + C6-C11 (expanded). See church-rbac.ts for full mapping. */
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
