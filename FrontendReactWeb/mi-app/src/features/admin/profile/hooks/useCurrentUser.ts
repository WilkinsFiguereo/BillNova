'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStoredAuthState } from '@/features/auth/login/data/storage';
import { apiClearAvatar, apiGetProfile, apiUpdateAvatar, apiUpdateProfile } from '../data/profileApi';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  phone?: string;
  department?: string;
  address?: string;
}

function toAvatarDataUrl(avatar_base64?: string | null, avatar_mime?: string | null) {
  if (!avatar_base64) return null;
  const mime = avatar_mime && avatar_mime.startsWith('image/') ? avatar_mime : 'image/png';
  return `data:${mime};base64,${avatar_base64}`;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const stored = getStoredAuthState();
    const sessionToken = stored?.sessionToken;
    const dto = await apiGetProfile(sessionToken);
    setUser({
      id: String(dto.uid),
      name: dto.name,
      email: dto.email,
      role: dto.role,
      phone: dto.phone || '',
      department: dto.department || '',
      address: dto.address || '',
      avatar: toAvatarDataUrl(dto.avatar_base64, dto.avatar_mime),
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuario');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [refresh]);

  const updateProfile = useCallback(
    async (payload: Partial<Pick<CurrentUser, 'name' | 'email' | 'phone' | 'department' | 'address'>>) => {
      const stored = getStoredAuthState();
      const sessionToken = stored?.sessionToken;
      try {
        setSaving(true);
        setError(null);
        const dto = await apiUpdateProfile(
          {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            department: payload.department,
            address: payload.address,
          },
          sessionToken,
        );
        setUser((prev) => ({
          id: String(dto.uid),
          name: dto.name,
          email: dto.email,
          role: dto.role,
          phone: dto.phone || '',
          department: dto.department || '',
          address: dto.address || '',
          avatar: toAvatarDataUrl(dto.avatar_base64, dto.avatar_mime),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateAvatar = useCallback(async (dataUrl: string) => {
    const stored = getStoredAuthState();
    const sessionToken = stored?.sessionToken;
    try {
      setSaving(true);
      setError(null);
      const dto = await apiUpdateAvatar(dataUrl, sessionToken);
      setUser((prev) => ({
        id: String(dto.uid),
        name: dto.name,
        email: dto.email,
        role: dto.role,
        phone: dto.phone || '',
        department: dto.department || '',
        address: dto.address || '',
        avatar: toAvatarDataUrl(dto.avatar_base64, dto.avatar_mime),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar avatar');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const clearAvatar = useCallback(async () => {
    const stored = getStoredAuthState();
    const sessionToken = stored?.sessionToken;
    try {
      setSaving(true);
      setError(null);
      const dto = await apiClearAvatar(sessionToken);
      setUser((prev) => ({
        id: String(dto.uid),
        name: dto.name,
        email: dto.email,
        role: dto.role,
        phone: dto.phone || '',
        department: dto.department || '',
        address: dto.address || '',
        avatar: toAvatarDataUrl(dto.avatar_base64, dto.avatar_mime),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar avatar');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { user, loading, saving, error, refresh, updateProfile, updateAvatar, clearAvatar };
}

