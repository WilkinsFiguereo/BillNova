'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStoredAuthState } from '@/features/auth/login/data/storage';
import { authApi } from '@/features/auth/login/data/api';

const AVATAR_STORAGE_KEY = 'billnova.user.avatar';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  department?: string;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function getStoredAvatar(): string | undefined {
  if (!isBrowser()) return undefined;
  return localStorage.getItem(AVATAR_STORAGE_KEY) || undefined;
}

function setStoredAvatar(avatar: string | null) {
  if (!isBrowser()) return;
  if (avatar) {
    localStorage.setItem(AVATAR_STORAGE_KEY, avatar);
  } else {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const stored = getStoredAuthState();
    const cachedAvatar = getStoredAvatar();

    if (stored?.sessionToken) {
      try {
        const response = await authApi.getProfile(stored.sessionToken);
        if (response.ok && response.user) {
          const avatarUrl = response.user.avatar_url || cachedAvatar;
          if (avatarUrl) {
            setStoredAvatar(avatarUrl);
          }
          setUser({
            id: String(response.user.id),
            name: response.user.name || stored.name || 'Admin Demo',
            email: response.user.email || stored.email || 'admin@billnova.com',
            role: response.user.role || stored.role || 'admin',
            phone: response.user.phone || stored.phone,
            department: 'Operaciones',
            avatar: avatarUrl || cachedAvatar,
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching profile from backend:', err);
      }
    }

    setUser({
      id: String(stored?.uid ?? 1),
      name: stored?.name ?? 'Admin Demo',
      email: stored?.email ?? 'admin@billnova.com',
      role: stored?.role ?? 'admin',
      phone: stored?.phone ?? '(809) 555-0101',
      department: 'Operaciones',
      avatar: cachedAvatar,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadUser();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuario');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [loadUser]);

  const refreshUser = useCallback(() => {
    void loadUser();
  }, [loadUser]);

  const setAvatar = useCallback((avatarDataUrl: string) => {
    setStoredAvatar(avatarDataUrl);
    setUser(prev => prev ? { ...prev, avatar: avatarDataUrl } : null);
  }, []);

  return { user, loading, error, refreshUser, setAvatar };
}
