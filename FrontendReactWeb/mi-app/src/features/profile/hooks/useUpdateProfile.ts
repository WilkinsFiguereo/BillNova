'use client';

import { useState, useCallback } from 'react';
import { authApi } from '@/features/auth/login/data/api';
import { getStoredAuthState } from '@/features/auth/login/data/storage';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  avatar?: string;
}

export interface UpdateProfileResult {
  ok: boolean;
  avatar_url?: string;
  error?: string;
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<UpdateProfileResult> => {
    setLoading(true);
    setError(null);

    try {
      const sessionToken = getStoredAuthState()?.sessionToken;

      const apiData: { name?: string; phone?: string; avatar?: string } = {};
      if (data.name) apiData.name = data.name;
      if (data.phone) apiData.phone = data.phone;
      if (data.avatar) apiData.avatar = data.avatar;

      if (Object.keys(apiData).length > 0) {
        const result = await authApi.updateProfile(sessionToken, apiData);
        if (!result.ok) {
          setError(result.error ?? 'Error al actualizar perfil');
          setLoading(false);
          return { ok: false, error: result.error };
        }

        return { ok: true, avatar_url: result.avatar_url };
      }

      return { ok: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProfile, loading, error };
}
