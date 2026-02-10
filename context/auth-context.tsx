/**
 * KaNeXT OS Auth Context
 * Manages authentication state with AsyncStorage persistence.
 * Mock auth providers (Apple, Google, Email) — no real backend.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthProvider as AuthProviderType } from '@/types';

const SESSION_KEY = 'kx:session';
const ONBOARDING_KEY = 'kx:onboardingComplete';

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

  const signIn = useCallback(async (provider: AuthProviderType) => {
    // Mock session creation
    const session: AuthSession = {
      userId: `user-${Date.now()}`,
      displayName: provider === 'apple' ? 'Sammy K.' : provider === 'google' ? 'Sammy Kalejaiye' : 'Sammy',
      email: 'sammy@kanext.com',
      provider,
      token: `mock-token-${Date.now()}`,
      createdAt: new Date(),
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    dispatch({ type: 'SIGN_IN', payload: session });
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([SESSION_KEY, ONBOARDING_KEY]);
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  const value: AuthContextValue = { state, signIn, signOut, completeOnboarding };

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
