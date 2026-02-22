# Section C — State Management (Contexts)

## App Context (`context/app-context.tsx`)

```typescript
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
    id: 'fmu-basketball',
    name: 'Florida Memorial University',
    mode: 'sports',
    type: 'college_basketball',
    location: 'Miami Gardens, FL',
    description: 'Florida Memorial University Lions Men\'s Basketball',
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
  business: {
    id: 'kanext-biz',
    name: 'KaNeXT',
    mode: 'business',
    type: 'platform',
    location: 'Tennessee',
    description: 'KaNeXT Institutional OS Platform',
  },
  competition: {
    id: 'k1-league',
    name: 'K-1 Hypercar Championship',
    mode: 'competition',
    type: 'motorsport_league',
    location: 'Global',
    description: 'K-1 Hypercar Championship',
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
  business: {
    id: 'fy2026',
    name: 'FY 2026',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isCurrent: true,
  },
  competition: {
    id: 'k1-s1-2026',
    name: 'Season 1 · 2026',
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
```

## Business Context (`context/business-context.tsx`)

```typescript
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
```

## Nexus Context (`context/nexus-context.tsx`)

```typescript
/**
 * KaNeXT OS Nexus Context
 * State management for the Nexus conversation interface.
 */

import React, { createContext, useContext, useReducer, useCallback, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NexusState,
  NexusPanelState,
  TargetContext,
  Conversation,
  Message,
  SimulationResult,
  SavedSimulation,
  Mode,
  ConversationType,
  PlayerEvalConfig,
  SimulationThreadConfig,
  EvalSnapshot,
  GameOpsConfig,
} from '@/types';
import type { ActionIntent, MessageV2, NexusContext as NexusContextScope } from '@/types/nexus-v2';
import { MOCK_CONVERSATIONS, getMessagesForConversation } from '@/data/mock-nexus';
import { detectSimulationIntent, generateMockSimulation } from '@/data/mock-simulations';
import { sendToGPT, type ChatMessage } from '@/utils/openai';
import { processPlayerQuery } from '@/utils/nexus-player-query';
import { classifyIntent } from '@/utils/nexus-actions';
import { processAction, executeConfirmedAction } from '@/utils/nexus-action-engine';
import { mapRoleToRBAC } from '@/utils/nexus-rbac';
import { parseGPTResponse } from '@/utils/nexus-response-parser';
import { useMode, useAppContext, useActiveView } from './app-context';

const MAX_PINNED_CONVERSATIONS = 3;

// =============================================================================
// DEFAULT STATE
// =============================================================================

const defaultState: NexusState = {
  activeConversationId: null,
  conversations: MOCK_CONVERSATIONS,
  messages: [],
  panelState: 'closed',
  inputText: '',
  isLoading: false,
  activeSimulationId: null,
  simulations: {},
  savedSimulations: {},
  newConversationSheetOpen: false,
  evalSnapshots: {},
  targetContext: { organizationId: '' },
  pendingAction: undefined,
  pendingActionConversationId: undefined,
};

// =============================================================================
// ACTIONS
// =============================================================================

type NexusAction =
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_PANEL_STATE'; payload: NexusPanelState }
  | { type: 'SET_INPUT_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'NEW_CONVERSATION'; payload: Conversation }
  | { type: 'ADD_SIMULATION'; payload: SimulationResult }
  | { type: 'SET_ACTIVE_SIMULATION'; payload: string | null }
  | { type: 'OPEN_SIMULATION'; payload: string }
  | { type: 'SAVE_SIMULATION'; payload: SavedSimulation }
  | { type: 'OPEN_NEW_CONVERSATION_SHEET' }
  | { type: 'CLOSE_NEW_CONVERSATION_SHEET' }
  | { type: 'UPDATE_CONVERSATION_CONFIG'; payload: { id: string; evalConfig?: PlayerEvalConfig; simConfig?: SimulationThreadConfig; gameOpsConfig?: GameOpsConfig } }
  | { type: 'PIN_CONVERSATION'; payload: string }
  | { type: 'UNPIN_CONVERSATION'; payload: string }
  | { type: 'ADD_EVAL_SNAPSHOT'; payload: EvalSnapshot }
  | { type: 'RENAME_CONVERSATION'; payload: { id: string; title: string } }
  | { type: 'ARCHIVE_CONVERSATION'; payload: string }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SET_TARGET_CONTEXT'; payload: TargetContext | 'all' }
  | { type: 'ADD_V2_MESSAGES'; payload: (Message | MessageV2)[] }
  | { type: 'SET_PENDING_ACTION'; payload: { intent: ActionIntent; conversationId: string } }
  | { type: 'CLEAR_PENDING_ACTION' }
  | { type: 'UPDATE_CONFIRMATION_STATE'; payload: { messageId: string; state: 'confirmed' | 'cancelled' } };

function nexusReducer(state: NexusState, action: NexusAction): NexusState {
  switch (action.type) {
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };

    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'ADD_MESSAGE': {
      const newMessage = action.payload;
      // Update the conversation's lastMessage
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === newMessage.conversationId
          ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.timestamp }
          : conv
      );
      return {
        ...state,
        messages: [...state.messages, newMessage],
        conversations: updatedConversations,
      };
    }

    case 'SET_PANEL_STATE':
      return { ...state, panelState: action.payload };

    case 'SET_INPUT_TEXT':
      return { ...state, inputText: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SELECT_CONVERSATION': {
      const conversationId = action.payload;
      const messages = getMessagesForConversation(conversationId);
      return {
        ...state,
        activeConversationId: conversationId,
        messages,
        panelState: 'closed',
      };
    }

    case 'NEW_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        activeConversationId: action.payload.id,
        messages: [],
        panelState: 'closed',
      };

    case 'ADD_SIMULATION':
      return {
        ...state,
        simulations: {
          ...state.simulations,
          [action.payload.id]: action.payload,
        },
      };

    case 'SET_ACTIVE_SIMULATION':
      return {
        ...state,
        activeSimulationId: action.payload,
      };

    case 'OPEN_SIMULATION':
      return {
        ...state,
        activeSimulationId: action.payload,
        panelState: 'simulation',
      };

    case 'SAVE_SIMULATION':
      return {
        ...state,
        savedSimulations: {
          ...state.savedSimulations,
          [action.payload.id]: action.payload,
        },
      };

    case 'OPEN_NEW_CONVERSATION_SHEET':
      return { ...state, newConversationSheetOpen: true };

    case 'CLOSE_NEW_CONVERSATION_SHEET':
      return { ...state, newConversationSheetOpen: false };

    case 'UPDATE_CONVERSATION_CONFIG': {
      const { id, evalConfig, simConfig, gameOpsConfig } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === id
            ? {
                ...conv,
                ...(evalConfig !== undefined && { evalConfig }),
                ...(simConfig !== undefined && { simConfig }),
                ...(gameOpsConfig !== undefined && { gameOpsConfig }),
              }
            : conv
        ),
      };
    }

    case 'PIN_CONVERSATION': {
      const pinnedCount = state.conversations.filter((c) => c.isPinned).length;
      if (pinnedCount >= MAX_PINNED_CONVERSATIONS) {
        return state; // Already at max
      }
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload ? { ...conv, isPinned: true } : conv
        ),
      };
    }

    case 'UNPIN_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload ? { ...conv, isPinned: false } : conv
        ),
      };

    case 'ADD_EVAL_SNAPSHOT':
      return {
        ...state,
        evalSnapshots: {
          ...state.evalSnapshots,
          [action.payload.id]: action.payload,
        },
      };

    case 'RENAME_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id
            ? { ...conv, title: action.payload.title }
            : conv
        ),
      };

    case 'ARCHIVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        activeConversationId:
          state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: state.activeConversationId === action.payload ? [] : state.messages,
      };

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        activeConversationId:
          state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: state.activeConversationId === action.payload ? [] : state.messages,
      };

    case 'SET_TARGET_CONTEXT':
      return { ...state, targetContext: action.payload };

    case 'ADD_V2_MESSAGES': {
      const newMsgs = action.payload;
      // Update conversations' lastMessage for each message
      let convs = [...state.conversations];
      for (const msg of newMsgs) {
        convs = convs.map((conv) =>
          conv.id === msg.conversationId
            ? { ...conv, lastMessage: msg as Message, updatedAt: msg.timestamp }
            : conv
        );
      }
      return {
        ...state,
        messages: [...state.messages, ...(newMsgs as Message[])],
        conversations: convs,
      };
    }

    case 'SET_PENDING_ACTION':
      return {
        ...state,
        pendingAction: action.payload.intent,
        pendingActionConversationId: action.payload.conversationId,
      };

    case 'CLEAR_PENDING_ACTION':
      return {
        ...state,
        pendingAction: undefined,
        pendingActionConversationId: undefined,
      };

    case 'UPDATE_CONFIRMATION_STATE': {
      const { messageId, state: confirmState } = action.payload;
      return {
        ...state,
        messages: state.messages.map((msg) => {
          const v2 = msg as any;
          if (v2.id === messageId && v2.confirmation) {
            return { ...v2, confirmation: { ...v2.confirmation, state: confirmState } };
          }
          return msg;
        }),
      };
    }

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface NexusContextValue {
  state: NexusState;
  // Panel controls
  openConversations: () => void;
  openContextDrawer: () => void;
  openRoster: () => void;
  openRecruitingBoard: () => void;
  closePanel: () => void;
  // Conversation controls
  selectConversation: (id: string) => void;
  createNewConversation: () => void;
  // Message controls
  setInputText: (text: string) => void;
  sendMessage: () => void;
  // Simulation controls
  openSimulation: (id: string) => void;
  closeSimulation: () => void;
  getSimulation: (id: string) => SimulationResult | undefined;
  getSavedSimulation: (id: string) => SavedSimulation | undefined;
  saveSimulation: (simulation: SimulationResult, title?: string) => void;
  // New conversation sheet
  openNewConversationSheet: () => void;
  closeNewConversationSheet: () => void;
  createNewEval: () => void;
  createNewSim: () => void;
  // Conversation config
  updateConversationConfig: (id: string, evalConfig?: PlayerEvalConfig, simConfig?: SimulationThreadConfig) => void;
  // Pinning
  pinConversation: (id: string) => void;
  unpinConversation: (id: string) => void;
  // Eval snapshots
  getEvalSnapshot: (id: string) => EvalSnapshot | undefined;
  generatePlayerEval: (playerId: string, playerName: string, role: string) => void;
  // Conversation management
  renameConversation: (id: string, title: string) => void;
  archiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  // Context targeting
  setTargetContext: (target: TargetContext | 'all') => void;
  // Direct message injection (for onboarding, system messages)
  addAssistantMessage: (conversationId: string, content: string) => void;
  // Game Ops
  createNewGameOps: (gameId: string, opponent: string) => void;
  updateGameOpsStep: (conversationId: string, updates: Partial<GameOpsConfig>) => void;
  addUserMessage: (conversationId: string, content: string) => void;
  // Governed actions (v2)
  confirmAction: (messageId: string) => void;
  cancelAction: (messageId: string) => void;
  handleEscalationChoice: (messageId: string, action: string) => void;
}

const NexusContext = createContext<NexusContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface NexusProviderProps {
  children: ReactNode;
}

export function NexusProvider({ children }: NexusProviderProps) {
  const [state, dispatch] = useReducer(nexusReducer, defaultState);
  const mode = useMode();
  const { state: appState } = useAppContext();
  const activeView = useActiveView();

  // Sync targetContext from ActiveView whenever it changes
  React.useEffect(() => {
    if (activeView?.org_id) {
      dispatch({ type: 'SET_TARGET_CONTEXT', payload: { organizationId: activeView.org_id } });
    }
  }, [activeView?.org_id]);

  // Panel controls
  const openConversations = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'conversations' });
  }, []);

  const openContextDrawer = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'context' });
  }, []);

  const openRoster = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'roster' });
  }, []);

  const openRecruitingBoard = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'recruiting' });
  }, []);

  const closePanel = useCallback(() => {
    dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
  }, []);

  // Conversation controls
  const selectConversation = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CONVERSATION', payload: id });
  }, []);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'chat',
      mode,
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
  }, [mode]);

  // New conversation sheet
  const openNewConversationSheet = useCallback(() => {
    dispatch({ type: 'OPEN_NEW_CONVERSATION_SHEET' });
  }, []);

  const closeNewConversationSheet = useCallback(() => {
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  const createNewEval = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Player Evaluation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'eval',
      evalConfig: {
        playerId: null,
        role: null,
      },
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  const createNewSim = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Game Simulation',
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'sim',
      simConfig: {
        scenario: null,
      },
    };
    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    dispatch({ type: 'CLOSE_NEW_CONVERSATION_SHEET' });
  }, []);

  // Conversation config
  const updateConversationConfig = useCallback(
    (id: string, evalConfig?: PlayerEvalConfig, simConfig?: SimulationThreadConfig) => {
      dispatch({ type: 'UPDATE_CONVERSATION_CONFIG', payload: { id, evalConfig, simConfig } });
    },
    []
  );

  // Pinning
  const pinConversation = useCallback((id: string) => {
    dispatch({ type: 'PIN_CONVERSATION', payload: id });
  }, []);

  const unpinConversation = useCallback((id: string) => {
    dispatch({ type: 'UNPIN_CONVERSATION', payload: id });
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    dispatch({ type: 'RENAME_CONVERSATION', payload: { id, title } });
  }, []);

  const archiveConversation = useCallback((id: string) => {
    dispatch({ type: 'ARCHIVE_CONVERSATION', payload: id });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  }, []);

  const setTargetContext = useCallback((target: TargetContext | 'all') => {
    dispatch({ type: 'SET_TARGET_CONTEXT', payload: target });
  }, []);

  const addAssistantMessage = useCallback((conversationId: string, content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-injected`,
      conversationId,
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  // Game Ops
  const createNewGameOps = useCallback(async (gameId: string, opponent: string) => {
    const convId = `conv-${Date.now()}`;
    const defaultConfig: GameOpsConfig = {
      gameId,
      opponent,
      step: 'gathering',
      periodFormat: 'halves',
      periodLength: 1200,
      starters: [],
    };

    const newConversation: Conversation = {
      id: convId,
      title: `Game Ops: vs ${opponent}`,
      participants: [
        { id: 'user-1', name: 'You', role: 'owner' },
        { id: 'assistant', name: 'Nexus', role: 'member' },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
      isGroup: false,
      unreadCount: 0,
      type: 'game-ops',
      gameOpsConfig: defaultConfig,
    };

    dispatch({ type: 'NEW_CONVERSATION', payload: newConversation });
    addAssistantMessage(
      convId,
      `Game Ops vs ${opponent} — let me know the game info.\n\nI need: halves or quarters, period length, timeouts, starters. Or just tell me the league and I'll fill in the defaults.`
    );
  }, [addAssistantMessage]);

  const updateGameOpsStep = useCallback((conversationId: string, updates: Partial<GameOpsConfig>) => {
    const conv = state.conversations.find(c => c.id === conversationId);
    if (!conv?.gameOpsConfig) return;
    dispatch({
      type: 'UPDATE_CONVERSATION_CONFIG',
      payload: {
        id: conversationId,
        gameOpsConfig: { ...conv.gameOpsConfig, ...updates },
      },
    });
  }, [state.conversations]);

  const addUserMessage = useCallback((conversationId: string, content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-user`,
      conversationId,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  // Eval snapshots
  const getEvalSnapshot = useCallback(
    (id: string): EvalSnapshot | undefined => {
      return state.evalSnapshots[id];
    },
    [state.evalSnapshots]
  );

  const generatePlayerEval = useCallback(
    (playerId: string, playerName: string, role: string) => {
      if (!state.activeConversationId) return;

      // Generate mock eval snapshot
      const evalSnapshot: EvalSnapshot = {
        id: `eval-${Date.now()}`,
        generatedAt: new Date(),
        playerName,
        summary: `${playerName} demonstrates solid fundamentals and consistent effort. As a ${role.toLowerCase()}, they contribute valuable minutes with reliable production.`,
        strengths: [
          'Strong defensive positioning',
          'Consistent three-point shooting',
          'Excellent court vision',
          'High basketball IQ',
        ],
        areasForGrowth: [
          'Needs to improve free throw percentage',
          'Can be more aggressive on drives',
          'Work on finishing through contact',
        ],
        projectedImpact: Math.floor(Math.random() * 30) + 60, // 60-90
      };

      dispatch({ type: 'ADD_EVAL_SNAPSHOT', payload: evalSnapshot });

      // Create assistant message with eval
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-eval`,
        conversationId: state.activeConversationId,
        role: 'assistant',
        content: `Here's my evaluation for ${playerName}:`,
        timestamp: new Date(),
        metadata: {
          isEval: true,
          evalSnapshotId: evalSnapshot.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    },
    [state.activeConversationId]
  );

  // Message controls
  const setInputText = useCallback((text: string) => {
    dispatch({ type: 'SET_INPUT_TEXT', payload: text });
  }, []);

  // Track conversation history for GPT context
  const conversationHistoryRef = useRef<Map<string, ChatMessage[]>>(new Map());

  // Build NexusContext scope from app state
  const buildNexusScope = useCallback((): NexusContextScope => ({
    mode,
    org_id: appState.organization?.id || 'org-default',
    org_name: appState.organization?.name || 'Organization',
    scope_type: appState.program ? 'program' : 'org',
    scope_id: appState.program?.id,
    scope_name: appState.program?.name,
    season_id: appState.cycle?.id,
    season_label: appState.cycle?.name,
  }), [mode, appState]);

  const sendMessage = useCallback(async () => {
    if (!state.inputText.trim() || !state.activeConversationId) return;

    const conversationId = state.activeConversationId;
    const inputText = state.inputText.trim();

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_INPUT_TEXT', payload: '' });

    // Auto-name conversation based on first message
    const conversation = state.conversations.find((c) => c.id === conversationId);
    if (conversation && conversation.title === 'New Conversation') {
      const autoTitle = generateConversationTitle(inputText);
      dispatch({ type: 'RENAME_CONVERSATION', payload: { id: conversationId, title: autoTitle } });
    }

    // ── Governed Action Intercept (v2) ──
    // Classify intent locally before GPT. If it's a governed action, handle instantly.
    const intent = classifyIntent(inputText);

    // Handle pin/unpin directly in context
    if (intent.type === 'pin_conversation') {
      pinConversation(conversationId);
      const msg: Message = {
        id: `msg-${Date.now()}-pin`,
        conversationId,
        role: 'assistant',
        content: 'Conversation pinned.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: msg });
      return;
    }
    if (intent.type === 'unpin_conversation') {
      unpinConversation(conversationId);
      const msg: Message = {
        id: `msg-${Date.now()}-unpin`,
        conversationId,
        role: 'assistant',
        content: 'Conversation unpinned.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: msg });
      return;
    }

    if (intent.type !== 'none') {
      const rbacLevel = mapRoleToRBAC(appState.operatingRole || 'head_coach', mode);
      const nexusScope = buildNexusScope();
      const result = processAction(intent, nexusScope, rbacLevel, conversationId);

      if (result.handled) {
        dispatch({ type: 'ADD_V2_MESSAGES', payload: result.messages });
        if (result.needsConfirmation && result.pendingAction) {
          dispatch({
            type: 'SET_PENDING_ACTION',
            payload: { intent: result.pendingAction, conversationId },
          });
        }
        return; // Don't send to GPT — action handled locally
      }
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Check for simulation intent (sports mode, still uses mock sim engine)
    const simIntent = mode === 'sports' ? detectSimulationIntent(userMessage.content) : { isSimulation: false, opponent: '' };

    if (simIntent.isSimulation) {
      const simulation = generateMockSimulation(
        'FMU Lions',
        simIntent.opponent || 'Opponent'
      );
      dispatch({ type: 'ADD_SIMULATION', payload: simulation });

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        conversationId,
        role: 'assistant',
        content: `Here's my simulation analysis for the matchup against ${simIntent.opponent || 'the opponent'}:`,
        timestamp: new Date(),
        metadata: {
          isSimulation: true,
          simulationId: simulation.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Build conversation history for GPT
    const history = conversationHistoryRef.current.get(conversationId) ?? [];
    history.push({ role: 'user', content: inputText });

    // Keep last 20 messages for context window
    const trimmedHistory = history.slice(-20);
    conversationHistoryRef.current.set(conversationId, trimmedHistory);

    try {
      // Pre-process player queries in sports mode
      const playerQuery = mode === 'sports' ? processPlayerQuery(inputText) : null;

      const isGameOpsConv = conversation?.type === 'game-ops';
      const responseText = await sendToGPT({
        messages: trimmedHistory,
        context: {
          mode,
          organization: appState.organization,
          operatingRole: appState.operatingRole,
          program: appState.program,
          cycleName: appState.cycle?.name ?? null,
          isGameOps: isGameOpsConv,
          gameOpsOpponent: isGameOpsConv ? conversation?.gameOpsConfig?.opponent : undefined,
        },
        playerDataContext: playerQuery?.isPlayerQuery ? playerQuery.contextBlock : undefined,
      });

      // Add assistant response to history
      trimmedHistory.push({ role: 'assistant', content: responseText });
      conversationHistoryRef.current.set(conversationId, trimmedHistory);

      // Parse for link chips ([LINK:type:id:label] tokens)
      const parsed = parseGPTResponse(responseText);
      if (parsed.linkChips.length > 0) {
        // Create a v2 message with link chips
        const v2Message: MessageV2 = {
          id: `msg-${Date.now()}-assistant`,
          conversationId,
          role: 'assistant',
          content: parsed.cleanText,
          timestamp: new Date(),
          messageType: 'text',
          linkChips: parsed.linkChips,
        };
        dispatch({ type: 'ADD_V2_MESSAGES', payload: [v2Message] });
      } else {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          conversationId,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      }

      // Post-process: if player data was injected, append inline player cards
      if (playerQuery?.isPlayerQuery && playerQuery.matchedPlayers && playerQuery.matchedPlayers.length > 0) {
        const playerCards: MessageV2[] = playerQuery.matchedPlayers.slice(0, 3).map((p: any, idx: number) => ({
          id: `msg-${Date.now()}-pcard-${idx}`,
          conversationId,
          role: 'assistant' as const,
          content: '',
          timestamp: new Date(),
          messageType: 'player_card' as const,
          playerCard: {
            playerId: p.id || p.player_id || `p-${idx}`,
            name: p.name || p.player_name || 'Unknown',
            position: p.position || '',
            team: p.team || p.school || '',
            kr: p.kr ?? p.overall_kr,
            levelKey: p.level_key || p.levelKey,
            archetype: p.archetype,
          },
        }));
        if (playerCards.length > 0) {
          dispatch({ type: 'ADD_V2_MESSAGES', payload: playerCards });
        }
      }
    } catch (error) {
      console.error('Failed to get GPT response:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        conversationId,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  }, [state.inputText, state.activeConversationId, state.conversations, mode, appState, buildNexusScope]);

  // Simulation controls
  const openSimulation = useCallback((id: string) => {
    dispatch({ type: 'OPEN_SIMULATION', payload: id });
  }, []);

  const closeSimulation = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_SIMULATION', payload: null });
    dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
  }, []);

  const getSimulation = useCallback(
    (id: string): SimulationResult | undefined => {
      return state.simulations[id];
    },
    [state.simulations]
  );

  const getSavedSimulation = useCallback(
    (id: string): SavedSimulation | undefined => {
      return state.savedSimulations[id];
    },
    [state.savedSimulations]
  );

  const saveSimulation = useCallback(
    (simulation: SimulationResult, title?: string) => {
      if (!state.activeConversationId) return;

      const savedSim: SavedSimulation = {
        ...simulation,
        threadId: state.activeConversationId,
        savedAt: new Date(),
        title: title || simulation.matchupText,
      };

      dispatch({ type: 'SAVE_SIMULATION', payload: savedSim });

      // Add a message to the thread with the saved snapshot
      const snapshotMessage: Message = {
        id: `msg-${Date.now()}-snapshot`,
        conversationId: state.activeConversationId,
        role: 'assistant',
        content: 'Simulation saved for reference.',
        timestamp: new Date(),
        metadata: {
          isSavedSimulation: true,
          simulationId: savedSim.id,
        },
      };
      dispatch({ type: 'ADD_MESSAGE', payload: snapshotMessage });

      // Close the simulation overlay
      dispatch({ type: 'SET_ACTIVE_SIMULATION', payload: null });
      dispatch({ type: 'SET_PANEL_STATE', payload: 'closed' });
    },
    [state.activeConversationId]
  );

  // ── Governed Action Confirm / Cancel (v2) ──
  const confirmAction = useCallback((messageId: string) => {
    const pending = state.pendingAction;
    const pendingConvId = state.pendingActionConversationId;
    if (!pending || !pendingConvId) return;

    // Update confirmation bubble to 'confirmed'
    dispatch({ type: 'UPDATE_CONFIRMATION_STATE', payload: { messageId, state: 'confirmed' } });

    // Execute the action and inject receipt
    const nexusScope = buildNexusScope();
    const receiptMsg = executeConfirmedAction(pending, nexusScope, pendingConvId);
    dispatch({ type: 'ADD_V2_MESSAGES', payload: [receiptMsg] });
    dispatch({ type: 'CLEAR_PENDING_ACTION' });
  }, [state.pendingAction, state.pendingActionConversationId, buildNexusScope]);

  const cancelAction = useCallback((messageId: string) => {
    // Update confirmation bubble to 'cancelled'
    dispatch({ type: 'UPDATE_CONFIRMATION_STATE', payload: { messageId, state: 'cancelled' } });
    dispatch({ type: 'CLEAR_PENDING_ACTION' });
  }, []);

  const handleEscalationChoice = useCallback((messageId: string, action: string) => {
    const conversationId = state.activeConversationId;
    if (!conversationId) return;

    if (action === 'create_request') {
      // Mock: inject a receipt for the created request
      const receiptMsg: MessageV2 = {
        id: `receipt-esc-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        messageType: 'receipt',
        receipt: {
          status: 'created',
          action_type: 'create_request',
          summary: 'Request created and routed to the appropriate owner.',
          objects: [],
        },
      };
      dispatch({ type: 'ADD_V2_MESSAGES', payload: [receiptMsg] });
    } else if (action === 'save_question') {
      const ackMsg: MessageV2 = {
        id: `ack-esc-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: 'Saved as an open question. You can revisit this anytime.',
        timestamp: new Date(),
        messageType: 'text',
      };
      dispatch({ type: 'ADD_V2_MESSAGES', payload: [ackMsg] });
    }
  }, [state.activeConversationId]);

  const value: NexusContextValue = {
    state,
    openConversations,
    openContextDrawer,
    openRoster,
    openRecruitingBoard,
    closePanel,
    selectConversation,
    createNewConversation,
    setInputText,
    sendMessage,
    openSimulation,
    closeSimulation,
    getSimulation,
    getSavedSimulation,
    saveSimulation,
    openNewConversationSheet,
    closeNewConversationSheet,
    createNewEval,
    createNewSim,
    updateConversationConfig,
    pinConversation,
    unpinConversation,
    getEvalSnapshot,
    generatePlayerEval,
    renameConversation,
    archiveConversation,
    deleteConversation,
    setTargetContext,
    addAssistantMessage,
    createNewGameOps,
    updateGameOpsStep,
    addUserMessage,
    confirmAction,
    cancelAction,
    handleEscalationChoice,
  };

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useNexusContext(): NexusContextValue {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error('useNexusContext must be used within a NexusProvider');
  }
  return context;
}

// =============================================================================
// HELPERS
// =============================================================================

// Mock response helpers removed — all responses now come from GPT-4o via utils/openai.ts

function generateConversationTitle(message: string): string {
  // Take first 40 characters and clean up
  let title = message.slice(0, 40).trim();

  // If we cut mid-word, find the last space
  if (message.length > 40) {
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 20) {
      title = title.slice(0, lastSpace);
    }
    title += '...';
  }

  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}
```

---

# Section D — Nexus AI Integration

## Player Query System (`utils/nexus-player-query.ts`)

```typescript
/**
 * Nexus Player Query Preprocessor
 *
 * Detects player-related queries in user messages and enriches
 * the GPT context with real data from the national player pool.
 * This runs BEFORE sending to GPT so the model has real data to reason about.
 */

import { nationalPool, type NationalPlayer, type SearchFilters } from '@/data/national-pool';
import {
  getKRColor,
  getKRTierLabel,
  getArchetypeDisplay,
  LEVEL_DISPLAY_SHORT,
  CLUSTER_LABELS,
  CLUSTER_ORDER,
} from '@/utils/kr-display';

// =============================================================================
// DETECTION — Is this a player/recruiting/scouting query?
// =============================================================================

const PLAYER_KEYWORDS = [
  'player', 'recruit', 'prospect', 'transfer', 'portal',
  'roster', 'scout', 'scouting', 'evaluate', 'evaluation',
  'kr', 'rating', 'ranked', 'ranking',
  'top', 'best', 'worst', 'highest', 'lowest',
  'archetype', 'badge', 'cluster',
  'scholarship', 'nil',
  'shooting', 'finishing', 'playmaking', 'defense', 'rebounding',
];

const POSITION_KEYWORDS = [
  'pg', 'sg', 'sf', 'pf', 'center',
  'guard', 'wing', 'forward', 'big',
  'point guard', 'shooting guard', 'small forward', 'power forward',
];

const LEVEL_KEYWORDS = [
  'naia', 'juco', 'njcaa', 'cccaa', 'd1', 'd2', 'd3',
  'division', 'ncaa', 'college',
];

const QUERY_PATTERNS = [
  /who (?:is|are) the/i,
  /show me/i,
  /find (?:me )?(?:a |the |some )?player/i,
  /search (?:for )?player/i,
  /look up/i,
  /compare/i,
  /tell me about/i,
  /what.+kr/i,
  /top \d+/i,
  /(?:best|highest|lowest|tallest|shortest).+(?:player|guard|wing|forward|big|center)/i,
  /how (?:good|tall|many) (?:is|are)/i,
];

export interface PlayerQueryResult {
  isPlayerQuery: boolean;
  contextBlock: string;
  playerCount: number;
  matchedPlayers?: NationalPlayer[];
}

/**
 * Detect whether a user message is about players/recruiting.
 * Returns false for clearly non-player queries.
 */
export function isPlayerRelatedQuery(text: string): boolean {
  const lower = text.toLowerCase();

  // Check query patterns
  for (const pattern of QUERY_PATTERNS) {
    if (pattern.test(lower)) return true;
  }

  // Check keyword density — need at least one player keyword + context
  let keywordHits = 0;
  for (const kw of PLAYER_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }
  for (const kw of POSITION_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }
  for (const kw of LEVEL_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }

  return keywordHits >= 2;
}

// =============================================================================
// EXTRACTION — Pull search parameters from natural language
// =============================================================================

interface ExtractedFilters {
  query?: string;
  level?: string[];
  position?: string[];
  minKR?: number;
  limit?: number;
  sortBy?: SearchFilters['sortBy'];
  hasPortalEntry?: boolean;
}

function extractFilters(text: string): ExtractedFilters {
  const lower = text.toLowerCase();
  const filters: ExtractedFilters = {};

  // Level extraction
  const levels: string[] = [];
  if (/\bnaia\b/i.test(lower)) levels.push('naia');
  if (/\bnjcaa\s*d1\b|\bjuco\s*d1\b/i.test(lower)) levels.push('njcaa_d1');
  if (/\bnjcaa\s*d2\b|\bjuco\s*d2\b/i.test(lower)) levels.push('njcaa_d2');
  if (/\bnjcaa\s*d3\b|\bjuco\s*d3\b/i.test(lower)) levels.push('njcaa_d3');
  if (/\bcccaa\b|\b3c2a\b/i.test(lower)) levels.push('cccaa');
  if (levels.length > 0) filters.level = levels;

  // Position extraction — canonical 5 positions: PG, CG, W, F, B
  const positions: string[] = [];
  if (/\bpg\b|\bpoint guard/i.test(lower)) positions.push('PG');
  if (/\bcg\b|\bcombo guard/i.test(lower)) positions.push('CG');
  if (/\bsg\b|\bshooting guard/i.test(lower)) positions.push('CG');
  if (/\bwing\b|\bw\b/i.test(lower) && /player|position|wing/i.test(lower)) positions.push('W');
  if (/\bsf\b|\bsmall forward/i.test(lower)) positions.push('W');
  if (/\bforward\b|\bpf\b|\bpower forward/i.test(lower)) positions.push('F');
  if (/\bbig\b|\bcenter\b/i.test(lower) && /player|position|big|center/i.test(lower)) positions.push('B');
  if (/\b[cb]\b/i.test(lower) && /player|position|big|center/i.test(lower)) positions.push('B');
  if (/\bguard/i.test(lower) && !positions.length) { positions.push('PG'); positions.push('CG'); }
  if (positions.length > 0) filters.position = [...new Set(positions)];

  // KR threshold
  const krMatch = lower.match(/kr\s*(?:above|over|>=?|at least)\s*(\d+)/i);
  if (krMatch) filters.minKR = parseInt(krMatch[1], 10);
  if (/top\s*\d/i.test(lower)) filters.minKR = filters.minKR ?? 1; // exclude unrated

  // Limit
  const limitMatch = lower.match(/top\s+(\d+)/i);
  if (limitMatch) filters.limit = Math.min(parseInt(limitMatch[1], 10), 25);
  if (!filters.limit) filters.limit = 15; // default

  // Portal
  if (/portal|transfer/i.test(lower)) filters.hasPortalEntry = true;

  // Sort
  if (/tallest|height/i.test(lower)) filters.sortBy = 'height';
  else if (/scorer|ppg|point/i.test(lower)) filters.sortBy = 'ppg';
  else if (/rebound|rpg/i.test(lower)) filters.sortBy = 'rpg';
  else if (/assist|apg/i.test(lower)) filters.sortBy = 'apg';
  else filters.sortBy = 'kr';

  // Name search — extract quoted names or proper nouns
  const nameMatch = text.match(/"([^"]+)"|'([^']+)'/);
  if (nameMatch) {
    filters.query = nameMatch[1] || nameMatch[2];
  } else {
    // Try to detect a school or player name (capitalized words not in keyword lists)
    const words = text.split(/\s+/);
    const possibleNames = words.filter((w) => {
      const wl = w.toLowerCase().replace(/[^a-z]/g, '');
      return w.length > 2 &&
        w[0] === w[0].toUpperCase() &&
        !PLAYER_KEYWORDS.includes(wl) &&
        !POSITION_KEYWORDS.includes(wl) &&
        !LEVEL_KEYWORDS.includes(wl) &&
        !['the', 'who', 'are', 'what', 'how', 'top', 'best', 'find', 'show', 'tell', 'about', 'from', 'with'].includes(wl);
    });
    if (possibleNames.length > 0 && possibleNames.length <= 4) {
      filters.query = possibleNames.join(' ');
    }
  }

  return filters;
}

// =============================================================================
// FORMATTING — Build context block for GPT
// =============================================================================

function formatPlayerForGPT(p: NationalPlayer, rank: number): string {
  const kr = p.kr != null ? `KR ${Math.round(p.kr)}` : 'Unrated';
  const tier = p.kr != null ? getKRTierLabel(p.kr, p.levelKey) : '';
  const arch = getArchetypeDisplay(p.archetype);
  const level = LEVEL_DISPLAY_SHORT[p.levelKey] ?? p.levelKey;
  const stats = p.ppg != null
    ? `${p.ppg.toFixed(1)}/${p.rpg?.toFixed(1) ?? '0.0'}/${p.apg?.toFixed(1) ?? '0.0'} PPG/RPG/APG`
    : 'No stats';
  const portal = p.portalEntryDate ? ` [PORTAL: ${p.portalEntryDate}]` : '';
  const clusters = p.clusters
    ? CLUSTER_ORDER.map((k) => {
        const score = (p.clusters as any)[k];
        return score != null ? `${CLUSTER_LABELS[k]?.label ?? k}: ${Math.round(score)}` : null;
      }).filter(Boolean).join(', ')
    : '';
  const scholarshipInfo = p.scholarship
    ? ` | Scholarship: ${p.scholarship.scholarshipPct ?? 0}%, NIL: $${(p.scholarship.nilAmount ?? 0).toLocaleString()}, Fit: ${p.scholarship.overallFitPct ?? 0}%`
    : '';

  let line = `${rank}. ${p.fullName} · ${p.position} · ${p.height}${p.weight ? ` / ${p.weight}lbs` : ''} · ${p.classYear} · ${p.school} (${level})`;
  line += ` · ${kr}${tier ? ` (${tier})` : ''} · ${arch} · ${stats}${portal}`;
  if (clusters) line += `\n   Clusters: ${clusters}`;
  if (scholarshipInfo) line += `\n   ${scholarshipInfo}`;

  return line;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Process a user message for player-related content.
 * Returns enriched context to inject into the GPT system prompt.
 */
export function processPlayerQuery(userMessage: string): PlayerQueryResult {
  if (!isPlayerRelatedQuery(userMessage)) {
    return { isPlayerQuery: false, contextBlock: '', playerCount: 0 };
  }

  const filters = extractFilters(userMessage);

  const results = nationalPool.search({
    query: filters.query,
    level: filters.level,
    position: filters.position,
    minKR: filters.minKR,
    hasPortalEntry: filters.hasPortalEntry,
    sortBy: filters.sortBy ?? 'kr',
    sortDir: filters.sortBy === 'name' ? 'asc' : 'desc',
    limit: filters.limit ?? 15,
  });

  if (results.length === 0) {
    return {
      isPlayerQuery: true,
      contextBlock: '\n[PLAYER DATA] No players found matching the query. The database contains ' +
        `${nationalPool.counts.players.toLocaleString()} players across ${nationalPool.getLevels().length} competitive levels ` +
        `(${nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}). ` +
        `${nationalPool.counts.withKR.toLocaleString()} have computed KR ratings.`,
      playerCount: 0,
    };
  }

  // Total matching (without limit)
  const totalMatching = nationalPool.search({
    query: filters.query,
    level: filters.level,
    position: filters.position,
    minKR: filters.minKR,
    hasPortalEntry: filters.hasPortalEntry,
  }).length;

  const lines = results.map((p, i) => formatPlayerForGPT(p, i + 1));

  const filterDesc = [
    filters.level ? `Level: ${filters.level.map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}` : null,
    filters.position ? `Position: ${filters.position.join(', ')}` : null,
    filters.minKR ? `Min KR: ${filters.minKR}` : null,
    filters.hasPortalEntry ? 'Portal entries only' : null,
    filters.query ? `Search: "${filters.query}"` : null,
  ].filter(Boolean).join(' | ');

  const contextBlock = [
    `\n[PLAYER DATA] Found ${totalMatching} players${filterDesc ? ` (${filterDesc})` : ''}. Showing top ${results.length}:`,
    ...lines,
    totalMatching > results.length ? `\n... and ${totalMatching - results.length} more matching players.` : '',
    `\nDatabase: ${nationalPool.counts.players.toLocaleString()} total players, ${nationalPool.counts.withKR.toLocaleString()} with KR, across ${nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}.`,
  ].join('\n');

  return {
    isPlayerQuery: true,
    contextBlock,
    playerCount: results.length,
    matchedPlayers: results,
  };
}

/**
 * Build the national pool awareness section for the system prompt.
 * This is always included in sports mode so Nexus knows it can answer player questions.
 */
export function buildPoolAwarenessPrompt(): string {
  const counts = nationalPool.counts;
  const levels = nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ');

  return [
    `\n## National Player Pool Intelligence`,
    `You have access to a real national player database with ${counts.players.toLocaleString()} players across these levels: ${levels}.`,
    `- ${counts.withKR.toLocaleString()} players have computed KaNeXT Ratings (KR, 0-100 scale)`,
    `- ${counts.withStats.toLocaleString()} have season statistics`,
    `- ${counts.withScholarship.toLocaleString()} have scholarship & NIL allocation recommendations`,
    `- ${counts.teamSystems} teams have OSIE/DSIE system identity profiles`,
    ``,
    `KR is level-aware — the same score means different things at different levels. Always reference the player's level when discussing KR.`,
    `Each player has 7 cluster scores (Shooting, Finishing, Playmaking, Perimeter D, Interior D, Rebounding, Physical) and a primary archetype.`,
    ``,
    `When the user asks about players, real data will be provided in [PLAYER DATA] blocks. Use this data to give specific, data-driven answers.`,
    `If no [PLAYER DATA] block is present, you can still discuss player evaluation concepts, KR methodology, or suggest queries.`,
    ``,
    `When referencing specific players, use [LINK:player:ID:Name] format for tappable links (e.g. [LINK:player:abc123:John Smith]).`,
  ].join('\n');
}
```

## OpenAI Integration (`utils/openai.ts`)

```typescript
/**
 * OpenAI API Client for Nexus
 * Sends chat completions to GPT-4o with a system prompt built from current app context.
 */

import OpenAI from 'openai';
import type { Mode, Role, Organization, Program } from '@/types';
import { buildPoolAwarenessPrompt } from '@/utils/nexus-player-query';

// API key loaded from environment or hardcoded for dev
// In production, this should come from a secure backend proxy
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      // Required for React Native — disables Node.js-specific features
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

// =============================================================================
// SYSTEM PROMPT BUILDER
// =============================================================================

interface NexusContext {
  mode: Mode;
  organization: Organization | null;
  operatingRole: Role;
  program: Program | null;
  cycleName: string | null;
  isOnboarding?: boolean;
  isGameOps?: boolean;
  gameOpsOpponent?: string;
}

function buildSystemPrompt(ctx: NexusContext): string {
  const parts: string[] = [];

  parts.push(
    `You are Nexus, the intelligence surface for KaNeXT OS. You are a reasoning assistant — you analyze, project, recommend, and answer questions. You do NOT execute actions or mutate state; you advise.`
  );

  parts.push(`\nCurrent context:`);
  parts.push(`- Mode: ${ctx.mode}`);

  if (ctx.organization) {
    parts.push(`- Organization: ${ctx.organization.name} (${ctx.organization.type})`);
    if (ctx.organization.location) {
      parts.push(`- Location: ${ctx.organization.location}`);
    }
    if (ctx.organization.description) {
      parts.push(`- Description: ${ctx.organization.description}`);
    }
  }

  parts.push(`- Operating Role: ${ctx.operatingRole}`);

  if (ctx.program) {
    parts.push(`- Program: ${ctx.program.name} (${ctx.program.level})`);
  }

  if (ctx.cycleName) {
    parts.push(`- Current Cycle/Season: ${ctx.cycleName}`);
  }

  // Mode-specific instructions
  switch (ctx.mode) {
    case 'sports':
      parts.push(`\nYou are a sports analytics assistant for collegiate basketball. You can analyze rosters, simulate matchups, evaluate players, project game outcomes, and explore strategic scenarios. You understand basketball strategy, recruiting, NIL, transfer portal, and program management.`);
      parts.push(buildPoolAwarenessPrompt());
      break;
    case 'business':
      parts.push(`\nYou are a strategic business advisor. You help analyze company metrics, model fundraising scenarios, evaluate market opportunities, plan resource allocation, and advise on growth strategy.`);
      break;
    case 'church':
      parts.push(`\nYou are a ministry planning assistant. You help analyze congregation patterns, plan events, coordinate ministries, manage giving insights, and support outreach initiatives.`);
      break;
    case 'education':
      parts.push(`\nYou are an academic planning assistant. You help analyze enrollment patterns, track academic performance, support faculty coordination, and plan institutional events.`);
      break;
  }

  if (ctx.isOnboarding) {
    parts.push(`\nThis is a NEW user who just signed in for the first time. Start by welcoming them to Nexus. Ask if they have an organization link or code to connect to an existing organization. If they provide one, confirm the connection (mock: connect them to "FMU Lions" as Head Coach). If they don't have one, let them know they can continue as a Viewer and join an organization later from Settings. Keep the onboarding natural and conversational — just a few quick questions, then let them explore.`);
  }

  if (ctx.isGameOps) {
    parts.push(`\n## GAME OPS MODE — vs ${ctx.gameOpsOpponent ?? 'opponent'}`);
    parts.push(`You are helping a coach set up a live basketball game. Your job is to gather the game configuration through natural conversation.`);
    parts.push(`\nYou need to collect:`);
    parts.push(`1. **Period format**: halves or quarters`);
    parts.push(`2. **Period length**: how long each period is (e.g. 20:00 for halves, 10:00 for quarters)`);
    parts.push(`3. **Timeouts**: how many per half/quarter, any 30-second vs full distinction`);
    parts.push(`4. **Bonus rules**: when bonus / double bonus kicks in (e.g. 7th foul, 10th foul)`);
    parts.push(`5. **Starters**: which 5 players are starting`);
    parts.push(`\nLeague shortcuts — if they say a league name, auto-fill defaults:`);
    parts.push(`- **NAIA**: 2 halves, 20:00 each, 4 timeouts per half (full only), bonus at 5th foul, double bonus at 10th`);
    parts.push(`- **NCAA D1/D2**: 2 halves, 20:00 each, 4 timeouts per half (30s + full), bonus at 7th foul, double bonus at 10th`);
    parts.push(`- **NCAA D3**: 2 halves, 20:00 each, 4 timeouts per half, bonus at 7th foul, double bonus at 10th`);
    parts.push(`- **NBA**: 4 quarters, 12:00 each, 7 timeouts per game, no bonus (penalty FT after 5th team foul per quarter)`);
    parts.push(`- **High School**: 4 quarters, 8:00 each, 5 timeouts per game, bonus at 7th foul, double bonus at 10th`);
    parts.push(`\nRules:`);
    parts.push(`- If the user gives you everything at once, confirm it in a short summary and ask for starters.`);
    parts.push(`- If they just name a league, confirm the defaults and ask for starters.`);
    parts.push(`- If something is missing, ask specifically what's missing — don't re-ask what they already told you.`);
    parts.push(`- Once you have ALL info including starters, give a final summary line like: "All set — [format], [length], [timeouts]. Starters: [names]. Ready to go?"`);
    parts.push(`- Keep responses SHORT. 1-3 sentences max. No paragraphs.`);
  }

  // ── Knowledge Learning System ──────────────────────────────────────────────
  parts.push(`
========================================
KNOWLEDGE LEARNING SYSTEM
========================================

Nexus gets smarter over time by learning from the people who run the organization.

KNOWLEDGE SOURCES:

You start with everything already in the system:
- Coaching manual and playbook
- System identity (offensive and defensive schemes)
- Game film with any tags or annotations
- Practice plans and drill library
- Roster data, stats, evaluations
- Organization documents, policies, procedures
- Financial data, budgets, allocations
- Compliance rules and requirements
- All previously answered questions

This is your base knowledge. Answer any question covered by this data.

ESCALATION FLOW:

When someone asks a question you cannot answer:

1. Search your full knowledge base
2. If you CAN answer → answer normally
3. If you CANNOT answer → respond: "I don't have the answer to this yet. Want me to send this question to [appropriate person]?"
4. Auto-detect who the right person is based on the topic and the organization hierarchy
5. If user taps Confirm → question is sent to that person via Messages
6. The message is tagged as a "Nexus Question" so the recipient knows it came from Nexus
7. Recipient sees the question with full context — who asked, what they were looking at, the exact question
8. Recipient answers in Messages
9. That answer feeds back into your knowledge base automatically
10. Next time anyone asks the same or similar question → answer directly using that answer
11. Credit the source: "According to Coach Brooks..." or "Pastor Kalejaiye has said..."

ROLE-BASED ESCALATION TARGETS:

${ctx.mode === 'sports' ? `Sports:
- Basketball strategy, plays, rotations → Head Coach
- Player development, workouts → Assistant Coach / Strength Coach
- Eligibility, compliance, immigration → Compliance Officer / AD
- Schedule, travel, logistics → Operations` :
ctx.mode === 'church' ? `Church:
- Theology, scripture, doctrine → Senior Pastor
- Ministry operations, volunteers → Ministry Leaders
- Events, logistics → Church Administrator
- Giving, finances → Finance Team` :
ctx.mode === 'business' ? `Business:
- Product, strategy, vision → Founder
- Legal, compliance → Legal Counsel
- Finance, budget → CFO / Finance Lead
- Deals, partnerships → Business Development` :
ctx.mode === 'education' ? `Education:
- Academics, curriculum → Department Chair / Dean
- Admissions, enrollment → Admissions Director
- Student issues → Dean of Students
- Compliance, accreditation → Provost` :
ctx.mode === 'competition' ? `Competition:
- Rules, regulations → Commissioner
- Technical, cars → Technical Director
- Race operations → Race Director
- Entries, wildcards → Operations Director` :
`Default: Escalate to the appropriate leader based on topic.`}

WHAT GETS LEARNED:

Only general knowledge — things that would help anyone who asks the same question. Private or one-off answers (like "tell Marcus to come see me after practice") do NOT get added to the knowledge base.

When the person answering flags their response:
- "Add to Nexus" → answer becomes part of your knowledge base, available to anyone with appropriate access
- "Private reply" → answer goes only to the person who asked, you do NOT learn from it

RBAC ON LEARNED KNOWLEDGE:

Not everyone sees the same answers. Respect role-based access:
- Players/members can ask about their own development, team schedule, general information
- Players/members CANNOT access strategy discussions, evaluations of others, budget details, or compliance information about others
- Staff can access more than players/members but less than the head coach/pastor/founder
- The top leader sees everything

When you learn an answer, tag it with the appropriate access level based on content. Strategy stays leader-level. General information is available to all.`);

  parts.push(`\nBe concise, direct, and actionable. Match the user's energy — short questions get short answers, detailed questions get detailed analysis. Never break character.`);

  return parts.join('\n');
}

// =============================================================================
// CHAT COMPLETION
// =============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SendMessageOptions {
  messages: ChatMessage[];
  context: NexusContext;
  /** Optional player data context block injected by the query preprocessor */
  playerDataContext?: string;
}

export async function sendToGPT({ messages, context, playerDataContext }: SendMessageOptions): Promise<string> {
  if (!OPENAI_API_KEY) {
    // Fallback: return a helpful message if no API key
    return "Nexus is not connected to GPT yet. Set EXPO_PUBLIC_OPENAI_API_KEY in your environment to enable AI responses.";
  }

  try {
    let systemPrompt = buildSystemPrompt(context);

    // Inject player data context if available
    if (playerDataContext) {
      systemPrompt += '\n' + playerDataContext;
    }

    const response = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    if (error?.status === 401) {
      return "Invalid API key. Please check your EXPO_PUBLIC_OPENAI_API_KEY.";
    }
    if (error?.status === 429) {
      return "Rate limit reached. Please try again in a moment.";
    }

    return "Something went wrong connecting to Nexus AI. Please try again.";
  }
}
```
