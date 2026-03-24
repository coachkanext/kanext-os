/**
 * KaNeXT OS Auth Context — v1 Locked
 *
 * Auth + Access Tier + Default Routing:
 *   1. Launch → Splash → silent session check
 *   2. If session valid → resolve tier → route to Business Mode Home
 *   3. If no session → auth modal → sign in → resolve tier → route to Business Mode Home
 *
 * Tier Resolver (strict priority):
 *   1. Email in founderAllowlist → FOUNDER
 *   2. Email in cofounderAllowlist → COFOUNDER
 *   3. Valid invite code → INVESTOR
 *   4. Else → PUBLIC
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthProvider as AuthProviderType, AccessTier } from '@/types';
import { resolveTier } from '@/config/access';
import { INVITE_CODES } from '@/config/invites';
import { supabase, USE_SUPABASE } from '@/lib/supabase';

const SESSION_KEY = 'kx:session';
const ONBOARDING_KEY = 'kx:onboardingComplete';
const INVITE_CODE_KEY = 'kx:pendingInviteCode';
const TIER_KEY = 'kx:accessTier';

// =============================================================================
// STATE
// =============================================================================

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  isNewUser: boolean;
}

const defaultState: AuthState = {
  session: null,
  isAuthenticated: false,
  isChecking: true,
  isNewUser: false,
};

// =============================================================================
// ACTIONS
// =============================================================================

type AuthAction =
  | { type: 'CHECK_SESSION_START' }
  | { type: 'CHECK_SESSION_DONE'; payload: { session: AuthSession | null; onboardingComplete: boolean } }
  | { type: 'SIGN_IN'; payload: AuthSession }
  | { type: 'SIGN_OUT' }
  | { type: 'COMPLETE_ONBOARDING' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'CHECK_SESSION_START':
      return { ...state, isChecking: true };
    case 'CHECK_SESSION_DONE': {
      const { session, onboardingComplete } = action.payload;
      return {
        ...state,
        session,
        isAuthenticated: session !== null,
        isChecking: false,
        isNewUser: session !== null && !onboardingComplete,
      };
    }
    case 'SIGN_IN':
      return {
        ...state,
        session: action.payload,
        isAuthenticated: true,
        isChecking: false,
        isNewUser: true,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        session: null,
        isAuthenticated: false,
        isChecking: false,
        isNewUser: false,
      };
    case 'COMPLETE_ONBOARDING':
      return { ...state, isNewUser: false };
    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface AuthContextValue {
  state: AuthState;
  signIn: (provider: AuthProviderType) => Promise<void>;
  signInAsInvestor: () => Promise<void>;
  signInWithSupabase: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, defaultState);

  // Silent session check on mount
  useEffect(() => {
    const checkSession = async () => {
      dispatch({ type: 'CHECK_SESSION_START' });
      try {
        const [sessionJson, onboardingFlag] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);

        let session: AuthSession | null = null;
        if (sessionJson) {
          const parsed = JSON.parse(sessionJson);
          session = { ...parsed, createdAt: new Date(parsed.createdAt) };
          // Migrate stale demo sessions with wrong name/handle
          if (session && session.email === 'coachk@kanext.io') {
            session = { ...session, displayName: 'Sammy Kalejaiye', handle: 'coachk' };
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
          }
        }

        dispatch({
          type: 'CHECK_SESSION_DONE',
          payload: { session, onboardingComplete: onboardingFlag === 'true' },
        });
      } catch (error) {
        console.error('Failed to check session:', error);
        dispatch({
          type: 'CHECK_SESSION_DONE',
          payload: { session: null, onboardingComplete: false },
        });
      }
    };

    checkSession();
  }, []);

  // Supabase auth state listener — syncs Supabase JWT session with app state
  useEffect(() => {
    if (!USE_SUPABASE) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sbSession) => {
        if (event === 'SIGNED_IN' && sbSession?.user) {
          // Supabase session exists — ensure our app-level session is synced
          const email = sbSession.user.email ?? '';
          const tier = resolveTier(email, null, INVITE_CODES);
          const session: AuthSession = {
            userId: sbSession.user.id,
            displayName: sbSession.user.user_metadata?.display_name ?? email.split('@')[0],
            email,
            provider: 'email',
            token: sbSession.access_token,
            createdAt: new Date(sbSession.user.created_at),
            tier,
          };
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
          await AsyncStorage.setItem(TIER_KEY, tier);
          dispatch({ type: 'SIGN_IN', payload: session });
        } else if (event === 'SIGNED_OUT') {
          // Let the app-level signOut handle cleanup
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (provider: AuthProviderType) => {
    const email = 'coachk@kanext.io';

    // Resolve access tier (strict priority: founder → investor → public)
    const pendingInviteCode = await AsyncStorage.getItem(INVITE_CODE_KEY);
    const tier = resolveTier(email, pendingInviteCode, INVITE_CODES);

    // Clear pending invite code after resolution
    if (pendingInviteCode) {
      await AsyncStorage.removeItem(INVITE_CODE_KEY);
    }

    const session: AuthSession = {
      userId: `user-${Date.now()}`,
      displayName: 'Sammy Kalejaiye',
      handle: 'coachk',
      email,
      provider,
      token: `mock-token-${Date.now()}`,
      createdAt: new Date(),
      tier,
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    await AsyncStorage.setItem(TIER_KEY, tier);
    dispatch({ type: 'SIGN_IN', payload: session });
  }, []);

  const signInAsInvestor = useCallback(async () => {
    const email = 'investor@demo.kanext.io';
    const tier = resolveTier(email, 'KX-INVESTOR-2026', INVITE_CODES);

    const session: AuthSession = {
      userId: `user-${Date.now()}`,
      displayName: 'Investor Demo',
      handle: 'investordemo',
      email,
      provider: 'email',
      token: `mock-token-${Date.now()}`,
      createdAt: new Date(),
      tier,
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    await AsyncStorage.setItem(TIER_KEY, tier);
    dispatch({ type: 'SIGN_IN', payload: session });
  }, []);

  const signInWithSupabase = useCallback(async (email: string, password: string) => {
    if (!USE_SUPABASE) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // The onAuthStateChange listener will handle dispatching SIGN_IN
    // But we also set it explicitly for immediate UI response
    const tier = resolveTier(email, null, INVITE_CODES);
    const session: AuthSession = {
      userId: data.user.id,
      displayName: data.user.user_metadata?.display_name ?? email.split('@')[0],
      handle: data.user.user_metadata?.handle ?? email.split('@')[0],
      email,
      provider: 'email',
      token: data.session.access_token,
      createdAt: new Date(data.user.created_at),
      tier,
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    await AsyncStorage.setItem(TIER_KEY, tier);
    dispatch({ type: 'SIGN_IN', payload: session });
  }, []);

  const signOut = useCallback(async () => {
    // Sign out of Supabase if configured
    if (USE_SUPABASE) {
      await supabase.auth.signOut().catch(() => {});
    }
    await AsyncStorage.multiRemove([SESSION_KEY, ONBOARDING_KEY]);
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  const value: AuthContextValue = { state, signIn, signInAsInvestor, signInWithSupabase, signOut, completeOnboarding };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// HOOKS
// =============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useSession(): AuthSession | null {
  const { state } = useAuth();
  return state.session;
}

export function useIsAuthenticated(): boolean {
  const { state } = useAuth();
  return state.isAuthenticated;
}
