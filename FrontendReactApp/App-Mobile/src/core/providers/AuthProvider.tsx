import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { authApi } from '../../features/auth/api/authApi';
import { tokenStorage } from '../storage/tokenStorage';
import type { AuthState, AuthUser, LoginPayload, RegisterPayload } from '../../features/auth/types/auth.types';

WebBrowser.maybeCompleteAuthSession();


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

  const buildGoogleRedirectUri = useCallback(() => {
    const generatedUrl = Linking.createURL('/auth');

    if (generatedUrl) {
      return generatedUrl;
    }

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return 'appmobile://auth';
    }

    return '/auth';
  }, []);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const [user, token] = await Promise.all([
        tokenStorage.getUser<AuthUser>(),
        tokenStorage.getToken(),
      ]);

      console.log('[mobile][auth] restoring session', {
        hasStoredUser: Boolean(user),
        hasStoredToken: Boolean(token),
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

          await tokenStorage.saveUser(restoredUser);
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
      uid:   data.uid!,
      login: data.email ?? payload.login,
      name:  data.name ?? payload.login,
      email: data.email,
      role: data.role,
      company_id: data.company_id ?? null,
    };

    const sessionHandle = data.session_token ?? data.session_id;
    if (!sessionHandle) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { ok: false, error: 'El servidor no devolvió session_token.' };
    }

    await tokenStorage.saveSession({ token: sessionHandle, user });
    dispatch({
      type: 'SET_SESSION',
      payload: { user, token: sessionHandle },
    });
    return { ok: true };
  }, []);

  // En AuthProvider o useAuth
  const loginWithGoogle = useCallback(async (_mode: 'login' | 'register' = 'login') => {
    try {
      // 1. Obtener auth_url de Odoo
      const redirectUri = 'appmobile://auth';
      const { data, error } = await authApi.googleAuthorizeUrl(redirectUri);

      if (!data?.ok || !data.auth_url) {
        return { ok: false, error: error ?? 'No se pudo obtener la URL de Google' };
      }

      // 2. Abrir browser con openAuthSessionAsync
      //    Esto maneja el retorno del deep link automáticamente en iOS y Android
      const result = await WebBrowser.openAuthSessionAsync(
        data.auth_url,
        redirectUri
      );

      console.log('[mobile][auth] google webBrowser result', result);

      if (result.type !== 'success') {
        return { ok: false, error: 'Autenticación cancelada o cerrada' };
      }

      // 3. Parsear el deep link de retorno
      //    result.url = "appmobile://auth?ok=1&uid=2&session_token=xxx&..."
      const returnUrl = result.url;

      // Extraer query params sin URL() porque puede fallar con custom schemes en algunos entornos
      const queryStart = returnUrl.indexOf('?');
      if (queryStart === -1) {
        return { ok: false, error: 'Respuesta inválida de Google' };
      }

      const params = new URLSearchParams(returnUrl.slice(queryStart + 1));
      const ok = params.get('ok') === '1';

      if (!ok) {
        const errMsg = params.get('error') ?? 'Error en autenticación con Google';
        return { ok: false, error: decodeURIComponent(errMsg) };
      }

      const sessionToken = params.get('session_token');
      const sessionId    = params.get('session_id');
      const uid          = params.get('uid');
      const name         = params.get('name');
      const email        = params.get('email');
      const role         = params.get('role');
      const company_id   = params.get('company_id');

      const token = sessionToken ?? sessionId;
      if (!token) {
        return { ok: false, error: 'No se recibió token de sesión' };
      }

      const user: AuthUser = {
        uid:        Number(uid),
        login:      email ?? '',
        name:       name ? decodeURIComponent(name) : (email ?? ''),
        email:      email ?? undefined,
        role:       role ?? 'seller',
        company_id: company_id ? Number(company_id) : null,
      };

      // 4. Guardar sesión Y actualizar estado
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
