/**
 * Church Context — Church Mode state
 * 5-level RBAC via ChurchRoleLens.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { ChurchRoleLens } from '@/utils/church-rbac';

interface ChurchContextValue {
  /** 5-level RBAC: C1 (Senior Pastor) | C2 (Elder/Board) | C3 (Staff) | C4 (Member) | C5 (Visitor) */
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
