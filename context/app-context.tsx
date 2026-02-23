/**
 * KaNeXT OS Global App Context
 * Single source of truth for mode, organization, role, cycle, and auth state.
 * Includes AsyncStorage persistence for state across app restarts.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppContextState, Mode, Role, Organization, Cycle, Program, ActiveContext, RecentContext, ActiveView, ActiveViewKey } from '@/types';
import {
  DEFAULT_ACTIVE_CONTEXT,
  SEEDED_RECENT_CONTEXTS,
  getOrgById,
  getProgramById,
  getSeasonById,
  getDefaultContextForMode,
} from '@/data/mock-memberships';
import { deriveRoleBadge } from '@/utils/role-badge';
import { buildActiveView, getActiveViewKey } from '@/utils/active-view';
import { notifyViewSwitch } from '@/utils/view-switch-lifecycle';

// Storage keys
const STORAGE_KEYS = {
  lastMode: 'kx:lastMode',
  hasCompletedModePick: 'kx:hasCompletedModePick',
  auth: 'kx:auth',
  sportsOrganization: 'kx:sportsOrganization',
  sportsProgram: 'kx:sportsProgram',
  sportsSeason: 'kx:sportsSeason',
  activeContext: 'kx:activeContext',
  recentContexts: 'kx:recentContexts',
  activeView: 'kx:activeView',
};

// Auth state type
type AuthState = 'viewer' | 'owner';

// Landing tab for navigation control
type LandingTab = 'home' | 'nexus' | null;

// Extended state with auth, landing control, V2 context, and ActiveView
interface ExtendedAppState extends AppContextState {
  authState: AuthState;
  pendingLandingTab: LandingTab;
  activeContext: ActiveContext;
  recentContexts: RecentContext[];
  activeView: ActiveView | null;
  activeViewKey: ActiveViewKey;
}

// =============================================================================
// DEMO DATA
// =============================================================================

const DEMO_ORGANIZATIONS: Record<Mode, Organization> = {
  sports: {
    id: 'sports_kx',
    name: 'Lincoln University',
    mode: 'sports',
    type: 'college_athletics',
    location: 'Oakland, CA',
    description: 'Lincoln University — Oaklanders Athletics',
  },
  business: {
    id: 'biz_kx',
    name: 'KaNeXT',
    mode: 'business',
    type: 'platform',
    location: 'Atlanta, GA',
    description: 'KaNeXT — Command Center',
  },
  church: {
    id: 'church_kx',
    name: 'ICC',
    mode: 'church',
    type: 'faith',
    location: 'Los Angeles, CA',
    description: 'ICC — International Christian Center',
  },
  education: {
    id: 'edu_kx',
    name: 'Howard University',
    mode: 'education',
    type: 'university',
    location: 'Washington, DC',
    description: 'Howard University — Academic Institution',
  },
  competition: {
    id: 'comp_kx',
    name: 'Adidas 3SSB',
    mode: 'competition',
    type: 'grassroots_basketball',
    location: 'Rock Hill, SC',
    description: 'Adidas 3SSB — 3 Stripes Select Basketball',
  },
};

const DEMO_CYCLES: Record<Mode, Cycle> = {
  sports: {
    id: 'kx_2025_26',
    name: '2025-26',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2026-04-01'),
    isCurrent: true,
  },
  business: {
    id: 'biz_kx_fy2026',
    name: 'FY 2026',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isCurrent: true,
  },
  church: {
    id: 'church_kx_2026',
    name: '2026',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isCurrent: true,
  },
  education: {
    id: 'edu_kx_2025_26',
    name: '2025-26 Academic Year',
    startDate: new Date('2025-08-18'),
    endDate: new Date('2026-05-10'),
    isCurrent: true,
  },
  competition: {
    id: 'comp_kx_s1_2026',
    name: 'Season 1 \u00B7 2026',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-11-30'),
    isCurrent: true,
  },
};

const DEMO_ROLES: Record<Mode, Role> = {
  sports: 'head_coach',
  church: 'member',
  education: 'faculty',
  business: 'founder',
  competition: 'league_admin',
};

const DEMO_PROGRAM: Program = {
  id: 'kx_mbb',
  name: "Men's Basketball",
  level: 'varsity',
};

// Programs for sports mode
const SPORTS_PROGRAMS: Record<string, Program> = {
  "Men's Basketball": { id: 'kx_mbb', name: "Men's Basketball", level: 'varsity' },
};

// Seasons for sports mode
const SPORTS_SEASONS: Record<string, Cycle> = {
  '2025-26': { id: 'kx_2025_26', name: '2025-26', startDate: new Date('2025-10-01'), endDate: new Date('2026-04-01'), isCurrent: true },
};

// Organizations for sports mode (static for now)
const SPORTS_ORGANIZATIONS: Record<string, Organization> = {
  'Lincoln University': {
    id: 'sports_kx',
    name: 'Lincoln University',
    mode: 'sports',
    type: 'college_athletics',
    location: 'Oakland, CA',
    description: 'Lincoln University — Oaklanders Athletics',
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
  activeContext: DEFAULT_ACTIVE_CONTEXT,
  recentContexts: SEEDED_RECENT_CONTEXTS,
  activeView: null,
  activeViewKey: '',
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
  | { type: 'RESTORE_STATE'; payload: { mode: Mode; authState: AuthState; organization?: string; program?: string; season?: string } }
  | { type: 'SWITCH_CONTEXT'; payload: ActiveContext }
  | { type: 'SET_ACTIVE_VIEW'; payload: ActiveView };

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
    case 'SET_ACTIVE_VIEW': {
      const view = action.payload;
      const viewKey = getActiveViewKey(view);

      // Build legacy ActiveContext from the view for V2 backwards compat
      const legacyCtx: ActiveContext = {
        mode: view.mode,
        org_id: view.org_id,
        program_id: view.scope_id,
        season_id: view.season_id,
        membership_id: view.membership_id,
        derived_role_badge: view.derived_role_badge,
      };

      // Resolve legacy Organization shape
      const viewOrg = getOrgById(view.org_id);
      const legacyOrg: Organization | null = viewOrg
        ? { id: viewOrg.org_id, name: viewOrg.org_name, mode: viewOrg.mode, type: viewOrg.org_type ?? '', location: viewOrg.location, description: viewOrg.description }
        : { id: view.org_id, name: view.org_name, mode: view.mode, type: '', location: '', description: '' };

      // Resolve legacy Program shape
      const viewProgram = getProgramById(view.scope_id);
      const legacyProgram: Program | null = viewProgram
        ? { id: viewProgram.program_id, name: viewProgram.program_name, level: 'varsity' }
        : null;

      // Resolve legacy Cycle shape
      const viewSeason = getSeasonById(view.season_id);
      const legacyCycle: Cycle | null = viewSeason
        ? { id: viewSeason.season_id, name: viewSeason.season_name, startDate: new Date(viewSeason.start_date), endDate: new Date(viewSeason.end_date), isCurrent: viewSeason.is_current }
        : DEMO_CYCLES[view.mode] ?? null;

      // Push previous context to recents (dedup by membership_id)
      const prevCtx: RecentContext = { ...state.activeContext, timestamp: Date.now() };
      const dedupedRecents = state.recentContexts.filter(
        (r) => !(r.org_id === prevCtx.org_id && r.membership_id === prevCtx.membership_id),
      );
      const updatedRecents = [prevCtx, ...dedupedRecents].slice(0, 10);

      return {
        ...state,
        activeView: view,
        activeViewKey: viewKey,
        activeContext: legacyCtx,
        recentContexts: updatedRecents,
        mode: view.mode,
        organization: legacyOrg,
        program: legacyProgram,
        cycle: legacyCycle,
        operatingRole: DEMO_ROLES[view.mode] ?? 'head_coach',
        isFirstRun: false,
      };
    }
    case 'SWITCH_CONTEXT': {
      const ctx = action.payload;
      const v2Org = getOrgById(ctx.org_id);
      const v2Program = getProgramById(ctx.program_id);
      const v2Season = getSeasonById(ctx.season_id);

      const legacyOrg: Organization | null = v2Org
        ? { id: v2Org.org_id, name: v2Org.org_name, mode: v2Org.mode, type: v2Org.org_type ?? '', location: v2Org.location, description: v2Org.description }
        : null;

      const legacyProgram: Program | null = v2Program
        ? { id: v2Program.program_id, name: v2Program.program_name, level: 'varsity' }
        : null;

      const legacyCycle: Cycle | null = v2Season
        ? { id: v2Season.season_id, name: v2Season.season_name, startDate: new Date(v2Season.start_date), endDate: new Date(v2Season.end_date), isCurrent: v2Season.is_current }
        : null;

      // Push previous context to recents (dedup by membership+program+season)
      const prev: RecentContext = { ...state.activeContext, timestamp: Date.now() };
      const deduped = state.recentContexts.filter(
        (r) => !(r.org_id === prev.org_id && r.program_id === prev.program_id && r.membership_id === prev.membership_id),
      );
      const newRecents = [prev, ...deduped].slice(0, 10);

      return {
        ...state,
        activeContext: ctx,
        recentContexts: newRecents,
        mode: ctx.mode,
        organization: legacyOrg,
        program: legacyProgram,
        cycle: legacyCycle,
        operatingRole: DEMO_ROLES[ctx.mode] ?? 'head_coach',
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
  switchContext: (ctx: ActiveContext) => void;
  setActiveView: (view: ActiveView) => void;
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
        // Try ActiveView first (new system)
        const savedActiveView = await AsyncStorage.getItem(STORAGE_KEYS.activeView);
        if (savedActiveView) {
          try {
            const parsed = JSON.parse(savedActiveView) as ActiveView;
            if (parsed.view_id && parsed.mode && parsed.org_id) {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: parsed });
              dispatch({ type: 'SET_LOADING', payload: false });
              // Also restore auth
              const auth = await AsyncStorage.getItem(STORAGE_KEYS.auth);
              if (auth) dispatch({ type: 'SET_AUTH_STATE', payload: (auth as AuthState) || 'viewer' });
              return; // Skip legacy restore
            }
          } catch { /* fall through to legacy */ }
        }

        // Legacy restore path
        const [lastMode, auth, organization, program, season] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.lastMode),
          AsyncStorage.getItem(STORAGE_KEYS.auth),
          AsyncStorage.getItem(STORAGE_KEYS.sportsOrganization),
          AsyncStorage.getItem(STORAGE_KEYS.sportsProgram),
          AsyncStorage.getItem(STORAGE_KEYS.sportsSeason),
        ]);

        if (lastMode) {
          // Migrate old mode names
          const resolvedMode = lastMode === 'community' ? 'competition' : lastMode;
          // Mode exists - skip first run
          dispatch({
            type: 'RESTORE_STATE',
            payload: {
              mode: resolvedMode as Mode,
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

  // Persist V2 recent contexts
  useEffect(() => {
    if (state.isLoading) return;
    AsyncStorage.setItem(STORAGE_KEYS.recentContexts, JSON.stringify(state.recentContexts)).catch(console.error);
  }, [state.recentContexts, state.isLoading]);

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
    // Try V2 context switch first, fall back to legacy
    const defaultCtx = getDefaultContextForMode(mode);
    if (defaultCtx) {
      const badge = deriveRoleBadge(defaultCtx.membership_id, defaultCtx.program_id);
      dispatch({ type: 'SWITCH_CONTEXT', payload: { ...defaultCtx, derived_role_badge: badge } });
    } else {
      dispatch({ type: 'SWITCH_MODE', payload: mode });
    }
  }, []);

  const switchContext = useCallback((ctx: ActiveContext) => {
    const badge = deriveRoleBadge(ctx.membership_id, ctx.program_id);
    dispatch({ type: 'SWITCH_CONTEXT', payload: { ...ctx, derived_role_badge: badge } });
    // Persist
    AsyncStorage.setItem(STORAGE_KEYS.activeContext, JSON.stringify({ ...ctx, derived_role_badge: badge })).catch(console.error);
  }, []);

  const setActiveView = useCallback((view: ActiveView) => {
    const newKey = getActiveViewKey(view);
    const prevKey = state.activeViewKey;
    // Dedup — no-op if same view tapped again
    if (newKey === prevKey && prevKey !== '') return;
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
    // Persist
    AsyncStorage.setItem(STORAGE_KEYS.activeView, JSON.stringify(view)).catch(console.error);
    AsyncStorage.setItem(STORAGE_KEYS.lastMode, view.mode).catch(console.error);
    // Notify lifecycle listeners
    notifyViewSwitch(view, prevKey);
  }, [state.activeViewKey]);

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
        STORAGE_KEYS.activeView,
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
    switchContext,
    setActiveView,
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

export function useActiveView(): ActiveView | null {
  const { state } = useAppContext();
  return state.activeView;
}

export function useActiveViewKey(): ActiveViewKey {
  const { state } = useAppContext();
  return state.activeViewKey;
}

export function useMembershipId(): string {
  const { state } = useAppContext();
  return state.activeView?.membership_id ?? state.activeContext.membership_id;
}

export function useOrgId(): string {
  const { state } = useAppContext();
  return state.activeView?.org_id ?? state.activeContext.org_id;
}
