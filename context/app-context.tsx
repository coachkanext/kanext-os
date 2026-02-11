/**
 * KaNeXT OS Global App Context
 * Single source of truth for mode, organization, role, cycle, and auth state.
 * Includes AsyncStorage persistence for state across app restarts.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppContextState, Mode, Role, Organization, Cycle, Program } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  lastMode: 'kx:lastMode',
  hasCompletedModePick: 'kx:hasCompletedModePick',
  auth: 'kx:auth',
  sportsOrganization: 'kx:sportsOrganization',
  sportsProgram: 'kx:sportsProgram',
  sportsSeason: 'kx:sportsSeason',
};

// Auth state type
type AuthState = 'viewer' | 'owner';

// Landing tab for navigation control
type LandingTab = 'home' | 'nexus' | null;

// Extended state with auth and landing control
interface ExtendedAppState extends AppContextState {
  authState: AuthState;
  pendingLandingTab: LandingTab;
}

// =============================================================================
// DEMO DATA
// =============================================================================

const DEMO_ORGANIZATIONS: Record<Mode, Organization> = {
  sports: {
    id: 'fmu-basketball',
    name: 'Florida Memorial University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Miami Gardens, FL',
    description: 'Florida Memorial University Lions Men\'s Basketball',
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

// Programs for sports mode
const SPORTS_PROGRAMS: Record<string, Program> = {
  'Varsity': { id: 'varsity', name: 'Varsity', level: 'varsity' },
  'Development I': { id: 'dev-1', name: 'Development I', level: 'development_1' },
  'Development II': { id: 'dev-2', name: 'Development II', level: 'development_2' },
  'Postgrad': { id: 'postgrad', name: 'Postgrad', level: 'postgrad' },
};

// Seasons for sports mode
const SPORTS_SEASONS: Record<string, Cycle> = {
  '2025-26': { id: '2025-26', name: '2025-26', startDate: new Date('2025-10-01'), endDate: new Date('2026-04-01'), isCurrent: true },
  '2024-25': { id: '2024-25', name: '2024-25', startDate: new Date('2024-10-01'), endDate: new Date('2025-04-01'), isCurrent: false },
  '2023-24': { id: '2023-24', name: '2023-24', startDate: new Date('2023-10-01'), endDate: new Date('2024-04-01'), isCurrent: false },
};

// Organizations for sports mode (static for now)
const SPORTS_ORGANIZATIONS: Record<string, Organization> = {
  'Florida Memorial University': {
    id: 'fmu-basketball',
    name: 'Florida Memorial University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Miami Gardens, FL',
    description: 'Florida Memorial University Lions Men\'s Basketball',
  },
  'Middlebrooks Academy': {
    id: 'middlebrooks-academy',
    name: 'Middlebrooks Academy',
    mode: 'sports',
    type: 'prep_school',
    location: 'Atlanta, GA',
    description: 'Elite Prep Basketball Program',
  },
  'Cathedral HS': {
    id: 'cathedral-hs',
    name: 'Cathedral HS',
    mode: 'sports',
    type: 'high_school',
    location: 'Indianapolis, IN',
    description: 'Cathedral High School Basketball',
  },
};

// Export for use in avatar drawer
export { SPORTS_ORGANIZATIONS, SPORTS_PROGRAMS, SPORTS_SEASONS };

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: ExtendedAppState = {
  mode: 'sports',
  organization: DEMO_ORGANIZATIONS.sports,
  operatingRole: DEMO_ROLES.sports,
  cycle: DEMO_CYCLES.sports,
  program: DEMO_PROGRAM,
  isFirstRun: true,
  isLoading: true,
  authState: 'viewer',
  pendingLandingTab: null,
};

// =============================================================================
// ACTIONS
// =============================================================================

type AppAction =
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SWITCH_MODE'; payload: Mode }
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CYCLE'; payload: Cycle | null }
  | { type: 'SET_PROGRAM'; payload: Program | null }
  | { type: 'SET_FIRST_RUN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_STATE'; payload: AuthState }
  | { type: 'SET_PENDING_LANDING_TAB'; payload: LandingTab }
  | { type: 'INITIALIZE'; payload: Partial<ExtendedAppState> }
  | { type: 'RESTORE_STATE'; payload: { mode: Mode; authState: AuthState; organization?: string; program?: string; season?: string } };

function appReducer(state: ExtendedAppState, action: AppAction): ExtendedAppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SWITCH_MODE': {
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
    case 'SET_AUTH_STATE':
      return { ...state, authState: action.payload };
    case 'SET_PENDING_LANDING_TAB':
      return { ...state, pendingLandingTab: action.payload };
    case 'INITIALIZE':
      return { ...state, ...action.payload, isLoading: false };
    case 'RESTORE_STATE': {
      const { mode, authState, organization, program, season } = action.payload;
      const resolvedOrganization = mode === 'sports' && organization && SPORTS_ORGANIZATIONS[organization]
        ? SPORTS_ORGANIZATIONS[organization]
        : DEMO_ORGANIZATIONS[mode];
      const resolvedProgram = program && SPORTS_PROGRAMS[program] ? SPORTS_PROGRAMS[program] : DEMO_PROGRAM;
      const resolvedSeason = season && SPORTS_SEASONS[season] ? SPORTS_SEASONS[season] : DEMO_CYCLES[mode];
      return {
        ...state,
        mode,
        organization: resolvedOrganization,
        operatingRole: DEMO_ROLES[mode],
        cycle: mode === 'sports' ? resolvedSeason : DEMO_CYCLES[mode],
        program: mode === 'sports' ? resolvedProgram : null,
        isFirstRun: false,
        isLoading: false,
        authState,
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
  state: ExtendedAppState;
  setMode: (mode: Mode) => void;
  switchMode: (mode: Mode) => void;
  setOrganization: (org: Organization | null) => void;
  setRole: (role: Role) => void;
  setCycle: (cycle: Cycle | null) => void;
  setProgram: (program: Program | null) => void;
  setFirstRun: (isFirstRun: boolean) => void;
  setAuthState: (authState: AuthState) => void;
  setPendingLandingTab: (tab: LandingTab) => void;
  completeFirstModePick: (mode: Mode) => Promise<void>;
  initialize: (initialState: Partial<ExtendedAppState>) => void;
  clearPersistedState: () => Promise<void>;
  logout: () => Promise<void>;
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
        const [lastMode, auth, organization, program, season] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.lastMode),
          AsyncStorage.getItem(STORAGE_KEYS.auth),
          AsyncStorage.getItem(STORAGE_KEYS.sportsOrganization),
          AsyncStorage.getItem(STORAGE_KEYS.sportsProgram),
          AsyncStorage.getItem(STORAGE_KEYS.sportsSeason),
        ]);

        if (lastMode) {
          // Mode exists - skip first run
          dispatch({
            type: 'RESTORE_STATE',
            payload: {
              mode: lastMode as Mode,
              authState: (auth as AuthState) || 'viewer',
              organization: organization || undefined,
              program: program || undefined,
              season: season || undefined,
            },
          });
        } else {
          // No saved mode - first run
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadPersistedState();
  }, []);

  // Persist mode when it changes
  useEffect(() => {
    if (state.isLoading || state.isFirstRun) return;
    AsyncStorage.setItem(STORAGE_KEYS.lastMode, state.mode).catch(console.error);
  }, [state.mode, state.isLoading, state.isFirstRun]);

  // Persist auth state when it changes
  useEffect(() => {
    if (state.isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.auth, state.authState).catch(console.error);
  }, [state.authState, state.isLoading]);

  // Persist sports organization/program/season when they change
  useEffect(() => {
    if (state.isLoading || state.mode !== 'sports') return;
    if (state.organization?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsOrganization, state.organization.name).catch(console.error);
    }
    if (state.program?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsProgram, state.program.name).catch(console.error);
    }
    if (state.cycle?.name) {
      AsyncStorage.setItem(STORAGE_KEYS.sportsSeason, state.cycle.name).catch(console.error);
    }
  }, [state.organization, state.program, state.cycle, state.mode, state.isLoading]);

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

  const setAuthState = useCallback((authState: AuthState) => {
    dispatch({ type: 'SET_AUTH_STATE', payload: authState });
  }, []);

  const setPendingLandingTab = useCallback((tab: LandingTab) => {
    dispatch({ type: 'SET_PENDING_LANDING_TAB', payload: tab });
  }, []);

  const completeFirstModePick = useCallback(async (mode: Mode) => {
    // Rule A: First-time mode selection
    // 1) Save lastMode
    // 2) Save hasCompletedModePick = "true"
    // 3) Set pending landing to HOME
    dispatch({ type: 'SWITCH_MODE', payload: mode });
    dispatch({ type: 'SET_PENDING_LANDING_TAB', payload: 'home' });
    dispatch({ type: 'SET_FIRST_RUN', payload: false });

    await AsyncStorage.setItem(STORAGE_KEYS.lastMode, mode);
    await AsyncStorage.setItem(STORAGE_KEYS.hasCompletedModePick, 'true');
  }, []);

  const initialize = useCallback((initialState: Partial<ExtendedAppState>) => {
    dispatch({ type: 'INITIALIZE', payload: initialState });
  }, []);

  const clearPersistedState = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.lastMode,
        STORAGE_KEYS.hasCompletedModePick,
        STORAGE_KEYS.auth,
        STORAGE_KEYS.sportsOrganization,
        STORAGE_KEYS.sportsProgram,
        STORAGE_KEYS.sportsSeason,
      ]);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    // Only clear auth state, NOT mode
    dispatch({ type: 'SET_AUTH_STATE', payload: 'viewer' });
    await AsyncStorage.setItem(STORAGE_KEYS.auth, 'viewer');
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
    setAuthState,
    setPendingLandingTab,
    completeFirstModePick,
    initialize,
    clearPersistedState,
    logout,
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

// Convenience hooks
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

export function useAuthState(): AuthState {
  const { state } = useAppContext();
  return state.authState;
}
