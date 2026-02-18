/**
 * Business Context — Business Mode state
 * Company switcher + 5-level RBAC via BusinessRoleLens.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { COMPANIES } from '@/data/mock-business-investor-v2';
import type { Company } from '@/types';
import type { BusinessRoleLens } from '@/utils/business-rbac';

interface BusinessContextValue {
  companies: Company[];
  activeCompanyId: string;
  activeCompany: Company;
  setActiveCompany: (id: string) => void;
  /** 5-level RBAC: B1 (Founder) | B2a (Retail) | B2b (Board) | B3 (Public) | B4 | B5 */
  viewAsRole: BusinessRoleLens;
  setViewAsRole: (role: BusinessRoleLens) => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [activeCompanyId, setActiveCompanyId] = useState('co-kanext');
  const [viewAsRole, setViewAsRoleState] = useState<BusinessRoleLens>('B1');

  const handleSetActive = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCompanyId(id);
  }, []);

  const handleSetViewAs = useCallback((role: BusinessRoleLens) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewAsRoleState(role);
  }, []);

  const activeCompany = COMPANIES.find((c) => c.id === activeCompanyId) || COMPANIES[1];

  return (
    <BusinessContext.Provider
      value={{
        companies: COMPANIES,
        activeCompanyId,
        activeCompany,
        setActiveCompany: handleSetActive,
        viewAsRole,
        setViewAsRole: handleSetViewAs,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}
