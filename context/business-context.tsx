/**
 * Business Context — Business Mode state
 * Company switcher + 5-level RBAC via BusinessRoleLens.
 * Entity scoping: selectedEntityId scopes all 10 Organization tabs.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { COMPANIES } from '@/data/mock-business-investor-v2';
import type { Company } from '@/types';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { KANEXT_HOLDCO, SEEDED_ENTITY_NAMES, SEEDED_ENTITY_TYPES, type BizEntityType } from '@/data/biz-org-shared-types';

export interface SelectedEntity {
  id: string;
  name: string;
  type: BizEntityType;
}

interface BusinessContextValue {
  companies: Company[];
  activeCompanyId: string;
  activeCompany: Company;
  setActiveCompany: (id: string) => void;
  /** 8-level RBAC: B1 (Founder) | B2a (Retail) | B2b (Board) | B3 (Public) | B4 | B5 | B8 (Advisor) | B13 (HoldCo) */
  viewAsRole: BusinessRoleLens;
  setViewAsRole: (role: BusinessRoleLens) => void;
  /** Entity scoping — scopes all 10 Org tabs */
  selectedEntityId: string;
  selectedEntity: SelectedEntity;
  setSelectedEntity: (id: string) => void;
  pinnedEntityIds: string[];
  setPinnedEntityIds: (ids: string[]) => void;
  recentEntityIds: string[];
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

const DEFAULT_PINNED = [KANEXT_HOLDCO, 'ent-kanext-opsco'];
const MAX_RECENT = 5;

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [activeCompanyId, setActiveCompanyId] = useState('co-kanext');
  const [viewAsRole, setViewAsRoleState] = useState<BusinessRoleLens>('B1');
  const [selectedEntityId, setSelectedEntityIdRaw] = useState(KANEXT_HOLDCO);
  const [pinnedEntityIds, setPinnedEntityIds] = useState<string[]>(DEFAULT_PINNED);
  const [recentEntityIds, setRecentEntityIds] = useState<string[]>([KANEXT_HOLDCO]);

  const handleSetActive = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCompanyId(id);
  }, []);

  const handleSetViewAs = useCallback((role: BusinessRoleLens) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewAsRoleState(role);
  }, []);

  const handleSetSelectedEntity = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEntityIdRaw(id);
    setRecentEntityIds((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT);
      return next;
    });
  }, []);

  const activeCompany = COMPANIES.find((c) => c.id === activeCompanyId) || COMPANIES[1];

  const selectedEntity: SelectedEntity = useMemo(() => ({
    id: selectedEntityId,
    name: SEEDED_ENTITY_NAMES[selectedEntityId] ?? 'Unknown Entity',
    type: SEEDED_ENTITY_TYPES[selectedEntityId] ?? 'internal',
  }), [selectedEntityId]);

  return (
    <BusinessContext.Provider
      value={{
        companies: COMPANIES,
        activeCompanyId,
        activeCompany,
        setActiveCompany: handleSetActive,
        viewAsRole,
        setViewAsRole: handleSetViewAs,
        selectedEntityId,
        selectedEntity,
        setSelectedEntity: handleSetSelectedEntity,
        pinnedEntityIds,
        setPinnedEntityIds,
        recentEntityIds,
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
