"use client";

import { useCallback, useEffect, useState } from "react";
import { authApi } from "../data/api";
import {
  clearStoredAuthState,
  getRememberMeDefault,
  getStoredAuthState,
  persistAuthState,
} from "../data/storage";
import type { AuthUser } from "../types/auth.types";

interface UseSessionReturn {
  user: AuthUser | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ ok: boolean; error?: string }>;
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    const cached = getStoredAuthState();
    if (cached) setUser(cached);

    try {
      const response = await authApi.getSession(cached?.sessionToken);
      if (response.ok && response.uid && response.email && response.name) {
        const sessionUser = {
          uid: response.uid,
          email: response.email,
          name: response.name,
          sessionToken: response.session_token ?? cached?.sessionToken,
          sessionExpiresAt: response.session_expires_at ?? cached?.sessionExpiresAt,
        };
        setUser(sessionUser);
        persistAuthState(sessionUser, getRememberMeDefault());
      } else {
        setUser(null);
        clearStoredAuthState();
      }
    } catch {
      setUser(cached);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const cached = getStoredAuthState();
      await authApi.logout(cached?.sessionToken);
    } finally {
      clearStoredAuthState();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string; companyName?: string }) => {
    const cached = getStoredAuthState();
    const result = await authApi.updateProfile(cached?.sessionToken, {
      name: data.name,
      phone: data.phone,
    });
    if (result.ok && user) {
      const updated = {
        ...user,
        name: data.name ?? user.name,
        phone: data.phone ?? user.phone,
        companyName: data.companyName ?? user.companyName,
      };
      setUser(updated);
      persistAuthState(updated, getRememberMeDefault());
    }
    return result;
  }, [user]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  return { user, isLoading, refreshSession, logout, updateProfile };
}