/**
 * Enterprise Context — Business Mode state
 * Company switcher, RBAC view-as role, PBD co-founder variant.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { COMPANIES } from '@/data/mock-enterprise-v2';
import type { Company, DocumentVisibility } from '@/types';

interface EnterpriseContextValue {
  companies: Company[];
  activeCompanyId: string;
  activeCompany: Company;
  setActiveCompany: (id: string) => void;
  viewAsRole: DocumentVisibility;
  setViewAsRole: (role: DocumentVisibility) => void;
  isPBDView: boolean;
  setIsPBDView: (v: boolean) => void;
}

const EnterpriseContext = createContext<EnterpriseContextValue | null>(null);

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
  const [activeCompanyId, setActiveCompanyId] = useState('co-kanext');
  const [viewAsRole, setViewAsRoleState] = useState<DocumentVisibility>('founder');
  const [isPBDView, setIsPBDViewState] = useState(false);

  const handleSetActive = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCompanyId(id);
  }, []);

  const handleSetViewAs = useCallback((role: DocumentVisibility) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewAsRoleState(role);
  }, []);

  const handleSetPBD = useCallback((v: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPBDViewState(v);
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
        isPBDView,
        setIsPBDView: handleSetPBD,
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
