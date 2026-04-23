import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { authApi } from '../../features/auth/api/authApi';
import { tokenStorage } from '../storage/tokenStorage';
import type { AuthState, AuthUser, LoginPayload, RegisterPayload } from '../../features/auth/types/auth.types';


// ─── State & Actions ─────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: { user: AuthUser; token: string | null } }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> }
  | { type: 'CLEAR_USER' };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : state.user,
      };
    case 'CLEAR_USER':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<{ ok: boolean; error?: string; code?: string; email?: string }>;
  loginWithGoogle: (mode?: 'login' | 'register') => Promise<{ ok: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string; email?: string; requiresVerification?: boolean; message?: string }>;
  updateUser: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const [user, token] = await Promise.all([
        tokenStorage.getUser<AuthUser>(),
        tokenStorage.getToken(),
      ]);

      if (token) {
        const { data } = await authApi.session();
        if (data?.ok && data.uid) {
          const restoredUser: AuthUser = {
            uid: data.uid,
            login: data.email ?? user?.login ?? '',
            name: data.name ?? user?.name ?? data.email ?? '',
            email: data.email,
            phone: user?.phone,
            address: user?.address,
            role: data.role ?? user?.role,
            company_id: data.company_id ?? user?.company_id ?? null,
            company_name: user?.company_name,
          };

          await tokenStorage.saveUser(restoredUser);
          dispatch({ type: 'SET_SESSION', payload: { user: restoredUser, token } });
          return;
        }
      }

      await tokenStorage.clearAll();
      dispatch({ type: 'SET_LOADING', payload: false });
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { data, error } = await authApi.login(payload);

    if (!data?.ok || error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        ok: false,
        error: data?.error ?? error ?? 'Login failed',
        code: data?.code,
        email: data?.email,
      };
    }

    const user: AuthUser = {
      uid:   data.uid!,
      login: data.email ?? payload.login,
      name:  data.name ?? payload.login,
      email: data.email,
      role: data.role,
      company_id: data.company_id ?? null,
    };

    const sessionHandle = data.session_id ?? data.session_token;
    if (!sessionHandle) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { ok: false, error: 'El servidor no devolvió session_token.' };
    }

    await tokenStorage.saveToken(sessionHandle);
    await tokenStorage.saveUser(user);
    dispatch({
      type: 'SET_SESSION',
      payload: { user, token: sessionHandle },
    });
    return { ok: true };
  }, []);

  const loginWithGoogle = useCallback(async (_mode: 'login' | 'register' = 'login') => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const redirectUri = Linking.createURL('/auth');
      console.log('[Google OAuth] redirectUri:', redirectUri);
      const { data, error: authUrlError } = await authApi.googleAuthorizeUrl(redirectUri);
      console.log('[Google OAuth] authorize-url response:', {
        hasData: !!data,
        ok: data?.ok,
        hasAuthUrl: !!data?.auth_url,
        error: authUrlError ?? data?.error ?? null,
      });

      if (!data?.ok || !data.auth_url || authUrlError) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return {
          ok: false,
          error: data?.error ?? authUrlError ?? 'No se pudo iniciar Google OAuth.',
        };
      }

      const callbackUrl = await new Promise<string>((resolve, reject) => {
        let settled = false;

        const timeoutId = setTimeout(() => {
          if (settled) return;
          settled = true;
          subscription.remove();
          reject(new Error('Google no respondio a tiempo.'));
        }, 90000);

        const subscription = Linking.addEventListener('url', ({ url }) => {
          console.log('[Google OAuth] deep link received:', url);
          if (settled || !url.startsWith(redirectUri)) return;
          settled = true;
          clearTimeout(timeoutId);
          subscription.remove();
          resolve(url);
        });

        Linking.openURL(data.auth_url).catch((openError) => {
          console.error('[Google OAuth] failed opening auth URL:', openError);
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          subscription.remove();
          reject(openError);
        });
      });
      console.log('[Google OAuth] callbackUrl parsed:', callbackUrl);

      const { queryParams } = Linking.parse(callbackUrl);
      const getParam = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

      const ok = getParam(queryParams?.ok);
      const sessionId = getParam(queryParams?.session_id);
      const sessionToken = getParam(queryParams?.session_token);
      const uid = getParam(queryParams?.uid);
      const login = getParam(queryParams?.login);
      const name = getParam(queryParams?.name);
      const email = getParam(queryParams?.email);
      const role = getParam(queryParams?.role);
      const companyId = getParam(queryParams?.company_id);
      const error = getParam(queryParams?.error);

      const sessionHandle = sessionId ?? sessionToken;

      if (ok !== '1' || !sessionHandle || !uid || !login) {
        console.warn('[Google OAuth] invalid callback payload:', {
          ok,
          hasSessionId: !!sessionId,
          hasSessionToken: !!sessionToken,
          uid,
          login,
          error,
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return {
          ok: false,
          error: error ?? 'No se pudo completar la autenticación con Google.',
        };
      }

      const user: AuthUser = {
        uid: Number(uid),
        login,
        name: name ?? login,
        email: email ?? undefined,
        role: role ?? undefined,
        company_id: companyId ? Number(companyId) : null,
      };

      await tokenStorage.saveToken(sessionHandle);
      await tokenStorage.saveUser(user);
      dispatch({
        type: 'SET_SESSION',
        payload: { user, token: sessionHandle },
      });
      console.log('[Google OAuth] login success:', {
        uid: user.uid,
        login: user.login,
        role: user.role ?? null,
        company_id: user.company_id ?? null,
      });
      return { ok: true };
    } catch (error) {
      console.error('[Google OAuth] flow failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Google OAuth failed',
      };
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { data, error } = await authApi.register(payload);

    if (!data?.ok || error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        ok: false,
        error: data?.error ?? error ?? 'Registration failed',
        email: data?.email,
        requiresVerification: data?.requires_verification,
      };
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return {
      ok: true,
      email: data.email,
      requiresVerification: data.requires_verification,
      message: data.message,
    };
  }, []);

  const updateUser = useCallback(async (user: AuthUser) => {
    await tokenStorage.saveUser(user);
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    await tokenStorage.clearAll();
    dispatch({ type: 'CLEAR_USER' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
