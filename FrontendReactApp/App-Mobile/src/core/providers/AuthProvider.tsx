import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { authApi } from '../../features/auth/api/authApi';
import { tokenStorage } from '../storage/tokenStorage';
import type { AuthState, AuthUser, LoginPayload, RegisterPayload } from '../../features/auth/types/auth.types';

WebBrowser.maybeCompleteAuthSession();

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

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<{ ok: boolean; error?: string; code?: string; email?: string }>;
  loginWithGoogle: (mode?: 'login' | 'register') => Promise<{ ok: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string; email?: string; requiresVerification?: boolean; message?: string }>;
  updateUser: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseReturnParams(url: string): URLSearchParams {
  const queryStart = url.indexOf('?');
  const hashStart = url.indexOf('#');
  const params = new URLSearchParams();

  if (queryStart !== -1) {
    const queryEnd = hashStart !== -1 ? hashStart : url.length;
    new URLSearchParams(url.slice(queryStart + 1, queryEnd)).forEach((value, key) => {
      params.set(key, value);
    });
  }

  if (hashStart !== -1) {
    new URLSearchParams(url.slice(hashStart + 1)).forEach((value, key) => {
      params.set(key, value);
    });
  }

  return params;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const buildGoogleRedirectUri = useCallback(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return 'appmobile://auth';
    }

    const generatedUrl = Linking.createURL('/auth');

    if (generatedUrl) {
      return generatedUrl;
    }

    return '/auth';
  }, []);

  useEffect(() => {
    (async () => {
      const persistedSession = await tokenStorage.getSession<AuthUser>();
      const user = persistedSession?.user ?? null;
      const token = persistedSession?.token ?? (await tokenStorage.getToken());

      console.log('[mobile][auth] restoring session', {
        hasStoredUser: Boolean(user),
        hasStoredToken: Boolean(token),
        hasPersistedSession: Boolean(persistedSession),
      });

      if (token && user) {
        dispatch({ type: 'SET_SESSION', payload: { user, token } });
      }

      if (token) {
        const { data, error, status } = await authApi.session();
        console.log('[mobile][auth] session restore response', {
          status,
          ok: data?.ok ?? null,
          error,
        });

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

          await tokenStorage.saveSession({ token, user: restoredUser });
          dispatch({ type: 'SET_SESSION', payload: { user: restoredUser, token } });
          return;
        }

        if (status === 401) {
          await tokenStorage.clearAll();
          dispatch({ type: 'CLEAR_USER' });
          return;
        }

        if (user) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
      }

      if (!token && user) {
        await tokenStorage.removeUser();
      }

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
      uid: data.uid!,
      login: data.email ?? payload.login,
      name: data.name ?? payload.login,
      email: data.email,
      role: data.role,
      company_id: data.company_id ?? null,
    };

    const sessionHandle = data.session_token ?? data.session_id;
    if (!sessionHandle) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { ok: false, error: 'El servidor no devolvio session_token.' };
    }

    await tokenStorage.saveSession({ token: sessionHandle, user });
    dispatch({
      type: 'SET_SESSION',
      payload: { user, token: sessionHandle },
    });
    return { ok: true };
  }, []);

  const loginWithGoogle = useCallback(async (_mode: 'login' | 'register' = 'login') => {
    try {
      const redirectUri = buildGoogleRedirectUri();
      const { data, error } = await authApi.googleAuthorizeUrl(redirectUri);

      if (!data?.ok || !data.auth_url) {
        console.warn('[mobile][auth] google authorize url failed', {
          error,
          backendMessage: data?.error,
        });
        return {
          ok: false,
          error: data?.error ?? error ?? 'Google OAuth no esta configurado en Odoo.',
        };
      }

      console.log('[mobile][auth] google login start via backend authorize-url', {
        redirectUri,
        platform: Platform.OS,
      });

      const result = await WebBrowser.openAuthSessionAsync(data.auth_url, redirectUri);
      console.log('[mobile][auth] google openAuthSession result', result);

      if (result.type !== 'success') {
        return { ok: false, error: 'Autenticacion cancelada o cerrada' };
      }

      const params = parseReturnParams(result.url);
      const providerError = params.get('error');
      if (providerError) {
        return { ok: false, error: providerError };
      }

      const ok = params.get('ok');
      if (ok !== '1') {
        return {
          ok: false,
          error: params.get('error') || 'No se completo el login con Google.',
        };
      }

      const token = params.get('session_token') || params.get('session_id');
      if (!token) {
        return { ok: false, error: 'No se recibio token de sesion desde Odoo.' };
      }

      const user: AuthUser = {
        uid: Number(params.get('uid') || 0),
        login: params.get('login') ?? '',
        name: params.get('name') ?? params.get('email') ?? 'Usuario',
        email: params.get('email') ?? undefined,
        role: params.get('role') ?? undefined,
        company_id: params.get('company_id') ? Number(params.get('company_id')) : null,
      };

      await tokenStorage.saveSession({ token, user });
      dispatch({ type: 'SET_SESSION', payload: { user, token } });
      return { ok: true };
    } catch (err) {
      console.error('[mobile][auth] loginWithGoogle error', err);
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Error inesperado con Google',
      };
    }
  }, [buildGoogleRedirectUri]);

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
    if (state.token) {
      await tokenStorage.saveSession({ token: state.token, user });
    } else {
      await tokenStorage.saveUser(user);
    }
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, [state.token]);

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

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
