/**
 * Education Context — Education Mode state
 * 14-level RBAC via EducationRoleLens (E0–E13).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { EducationRoleLens } from '@/utils/education-rbac';

interface EducationContextValue {
  /** 14-level RBAC: E0 (System Owner) through E13 (Board of Trustees) */
  viewAsRole: EducationRoleLens;
  setViewAsRole: (role: EducationRoleLens) => void;
}

const EducationContext = createContext<EducationContextValue | null>(null);

export function EducationProvider({ children }: { children: React.ReactNode }) {
  const [viewAsRole, setViewAsRoleState] = useState<EducationRoleLens>('E1');

  const handleSetViewAs = useCallback((role: EducationRoleLens) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewAsRoleState(role);
  }, []);

  return (
    <EducationContext.Provider
      value={{
        viewAsRole,
        setViewAsRole: handleSetViewAs,
      }}
    >
      {children}
    </EducationContext.Provider>
  );
}

export function useEducation(): EducationContextValue {
  const ctx = useContext(EducationContext);
  if (!ctx) throw new Error('useEducation must be used within EducationProvider');
  return ctx;
}
