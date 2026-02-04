/**
 * KaNeXT OS Global App Context
 * Single source of truth for mode, organization, role, and cycle state.
 * Includes AsyncStorage persistence for state across app restarts.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppContextState, Mode, Role, Organization, Cycle, Program } from '@/types';

const STORAGE_KEY = '@kanext_app_state';

// State shape for persistence (only save what's needed)
interface PersistedState {
  mode: Mode;
  operatingRole: Role;
  isFirstRun: boolean;
}

// =============================================================================
// DEMO DATA
// =============================================================================

const DEMO_ORGANIZATIONS: Record<Mode, Organization> = {
  sports: {
    id: 'lincoln-basketball',
    name: 'Lincoln University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Jefferson City, MO',
    description: 'Lincoln University Blue Tigers Men\'s Basketball',
  },
  enterprise: {
    id: 'kanext',
    name: 'KaNeXT',
    mode: 'enterprise',
    type: 'llc',
    location: 'Tennessee',
    description: 'Institutional OS + Governed Intelligence Platform',
  },
  church: {
    id: 'icc',
    name: 'International Christian Center',
    mode: 'church',
    type: 'church',
    location: 'Los Angeles, CA',
    description: 'Inter-denominational, Pentecostal',
  },
  education: {
    id: 'sdcc',
    name: 'San Diego Christian College',
    mode: 'education',
    type: 'college',
    location: 'San Diego County, CA',
    description: 'Private Christian Liberal Arts College',
  },
};

const DEMO_CYCLES: Record<Mode, Cycle> = {
  sports: {
    id: '2025-26',
    name: '2025-26',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2026-04-01'),
    isCurrent: true,
  },
  enterprise: {
    id: 'fy2025',
    name: 'FY 2025',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isCurrent: true,
  },
  church: {
    id: '2025',
    name: '2025',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isCurrent: true,
  },
  education: {
    id: '2025-26-academic',
    name: '2025-2026 Academic Year',
    startDate: new Date('2025-08-25'),
    endDate: new Date('2026-05-15'),
    isCurrent: true,
  },
};

const DEMO_ROLES: Record<Mode, Role> = {
  sports: 'head_coach',
  enterprise: 'founder',
  church: 'member',
  education: 'faculty',
};

const DEMO_PROGRAM: Program = {
  id: 'varsity',
  name: 'Varsity',
  level: 'varsity',
};

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: AppContextState = {
  mode: 'sports',
  organization: DEMO_ORGANIZATIONS.sports,
  operatingRole: DEMO_ROLES.sports,
  cycle: DEMO_CYCLES.sports,
  program: DEMO_PROGRAM,
  isFirstRun: true, // Show onboarding on first launch
  isLoading: true, // Start loading until persisted state is checked
};

// =============================================================================
// ACTIONS
// =============================================================================

type AppAction =
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SWITCH_MODE'; payload: Mode } // Full mode switch with org/role/cycle update
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CYCLE'; payload: Cycle | null }
  | { type: 'SET_PROGRAM'; payload: Program | null }
  | { type: 'SET_FIRST_RUN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZE'; payload: Partial<AppContextState> }
  | { type: 'RESTORE_STATE'; payload: PersistedState };

function appReducer(state: AppContextState, action: AppAction): AppContextState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SWITCH_MODE': {
      // Full mode switch - update organization, role, and cycle to match new mode
      const newMode = action.payload;
      return {
        ...state,
        mode: newMode,
        organization: DEMO_ORGANIZATIONS[newMode],
        operatingRole: DEMO_ROLES[newMode],
        cycle: DEMO_CYCLES[newMode],
        program: newMode === 'sports' ? DEMO_PROGRAM : null,
      };
    }
    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload };
    case 'SET_ROLE':
      return { ...state, operatingRole: action.payload };
    case 'SET_CYCLE':
      return { ...state, cycle: action.payload };
    case 'SET_PROGRAM':
      return { ...state, program: action.payload };
    case 'SET_FIRST_RUN':
      return { ...state, isFirstRun: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INITIALIZE':
      return { ...state, ...action.payload, isLoading: false };
    case 'RESTORE_STATE': {
      // Restore persisted state and fill in derived state
      const { mode, operatingRole, isFirstRun } = action.payload;
      return {
        ...state,
        mode,
        organization: DEMO_ORGANIZATIONS[mode],
        operatingRole,
        cycle: DEMO_CYCLES[mode],
        program: mode === 'sports' ? DEMO_PROGRAM : null,
        isFirstRun,
        isLoading: false,
      };
    }
    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface AppContextValue {
  state: AppContextState;
  setMode: (mode: Mode) => void;
  switchMode: (mode: Mode) => void; // Full mode switch with org/role/cycle update
  setOrganization: (org: Organization | null) => void;
  setRole: (role: Role) => void;
  setCycle: (cycle: Cycle | null) => void;
  setProgram: (program: Program | null) => void;
  setFirstRun: (isFirstRun: boolean) => void;
  initialize: (initialState: Partial<AppContextState>) => void;
  clearPersistedState: () => Promise<void>; // For testing/reset
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, defaultState);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const persisted: PersistedState = JSON.parse(stored);
          dispatch({ type: 'RESTORE_STATE', payload: persisted });
        } else {
          // No stored state - first run, stop loading
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadPersistedState();
  }, []);

  // Persist state when relevant values change
  useEffect(() => {
    if (state.isLoading) return; // Don't save while loading
    const persistState = async () => {
      try {
        const toPersist: PersistedState = {
          mode: state.mode,
          operatingRole: state.operatingRole,
          isFirstRun: state.isFirstRun,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
      } catch (error) {
        console.error('Failed to persist state:', error);
      }
    };
    persistState();
  }, [state.mode, state.operatingRole, state.isFirstRun, state.isLoading]);

  const setMode = useCallback((mode: Mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const switchMode = useCallback((mode: Mode) => {
    dispatch({ type: 'SWITCH_MODE', payload: mode });
  }, []);

  const setOrganization = useCallback((org: Organization | null) => {
    dispatch({ type: 'SET_ORGANIZATION', payload: org });
  }, []);

  const setRole = useCallback((role: Role) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  }, []);

  const setCycle = useCallback((cycle: Cycle | null) => {
    dispatch({ type: 'SET_CYCLE', payload: cycle });
  }, []);

  const setProgram = useCallback((program: Program | null) => {
    dispatch({ type: 'SET_PROGRAM', payload: program });
  }, []);

  const setFirstRun = useCallback((isFirstRun: boolean) => {
    dispatch({ type: 'SET_FIRST_RUN', payload: isFirstRun });
  }, []);

  const initialize = useCallback((initialState: Partial<AppContextState>) => {
    dispatch({ type: 'INITIALIZE', payload: initialState });
  }, []);

  const clearPersistedState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }, []);

  const value: AppContextValue = {
    state,
    setMode,
    switchMode,
    setOrganization,
    setRole,
    setCycle,
    setProgram,
    setFirstRun,
    initialize,
    clearPersistedState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for common access patterns
export function useMode(): Mode {
  const { state } = useAppContext();
  return state.mode;
}

export function useOrganization(): Organization | null {
  const { state } = useAppContext();
  return state.organization;
}

export function useOperatingRole(): Role {
  const { state } = useAppContext();
  return state.operatingRole;
}

export function useProgram(): Program | null {
  const { state } = useAppContext();
  return state.program;
}
