/**
 * Enterprise Context — Business Mode state
 * Company switcher + 4-level RBAC via BusinessRoleLens.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { COMPANIES } from '@/data/mock-enterprise-v2';
import type { Company } from '@/types';
import type { BusinessRoleLens } from '@/utils/business-rbac';

interface EnterpriseContextValue {
  companies: Company[];
  activeCompanyId: string;
  activeCompany: Company;
  setActiveCompany: (id: string) => void;
  /** 4-level RBAC: B1 (Founder) | B2b (Board) | B2a (Retail) | B3 (Public) */
  viewAsRole: BusinessRoleLens;
  setViewAsRole: (role: BusinessRoleLens) => void;
}

const EnterpriseContext = createContext<EnterpriseContextValue | null>(null);

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
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
    <EnterpriseContext.Provider
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
    </EnterpriseContext.Provider>
  );
}

export function useEnterprise(): EnterpriseContextValue {
  const ctx = useContext(EnterpriseContext);
  if (!ctx) throw new Error('useEnterprise must be used within EnterpriseProvider');
  return ctx;
}
