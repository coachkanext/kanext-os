/**
 * Education Context — Education Mode state
 * 5-level RBAC via EducationRoleLens.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { EducationRoleLens } from '@/utils/education-rbac';

interface EducationContextValue {
  /** 5-level RBAC: E1 (President) | E2 (Provost/Dean) | E3 (Faculty/Staff) | E4 (Student) | E5 (Public) */
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
