/**
 * Competition Context — Competition Mode state
 * Active series switcher + 7-level RBAC via CompetitionRoleLens (CO1-CO11).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import type { CompetitionRoleLens } from '@/utils/competition-rbac';

export interface CompSeries {
  id: string;
  name: string;
  shortName: string;
  format: string;
  status: 'upcoming' | 'live' | 'completed';
}

const DEFAULT_SERIES: CompSeries[] = [
  { id: 'ser-kcc-24', name: 'KaNeXT Church Season 2024-25', shortName: 'KaNeXT Church', format: 'League', status: 'live' },
  { id: 'ser-kx-24', name: 'KaNeXT Invitational 2024', shortName: 'KaNeXT', format: 'Tournament', status: 'completed' },
  { id: 'ser-pbdcup-25', name: 'PBD Cup 2025', shortName: 'PBD Cup', format: 'Cup', status: 'upcoming' },
];

interface CompetitionContextValue {
  seriesList: CompSeries[];
  activeSeriesId: string;
  activeSeries: CompSeries;
  setActiveSeries: (id: string) => void;
  viewAsRole: CompetitionRoleLens;
  setViewAsRole: (role: CompetitionRoleLens) => void;
}

const CompetitionContext = createContext<CompetitionContextValue | null>(null);

export function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const [activeSeriesId, setActiveSeriesId] = useState('ser-kcc-24');
  const [viewAsRole, setViewAsRoleState] = useState<CompetitionRoleLens>('CO1');

  const handleSetActive = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSeriesId(id);
  }, []);

  const handleSetViewAs = useCallback((role: CompetitionRoleLens) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewAsRoleState(role);
  }, []);

  const activeSeries = DEFAULT_SERIES.find((s) => s.id === activeSeriesId) || DEFAULT_SERIES[0];

  return (
    <CompetitionContext.Provider
      value={{
        seriesList: DEFAULT_SERIES,
        activeSeriesId,
        activeSeries,
        setActiveSeries: handleSetActive,
        viewAsRole,
        setViewAsRole: handleSetViewAs,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetition(): CompetitionContextValue {
  const ctx = useContext(CompetitionContext);
  if (!ctx) throw new Error('useCompetition must be used within CompetitionProvider');
  return ctx;
}
